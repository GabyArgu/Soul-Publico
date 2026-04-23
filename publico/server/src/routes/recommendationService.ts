// services/recommendationService.ts - Machine Learning UwU
import { getConnection, sql } from "../db";

interface UserProfile {
    idUsuario: number;
    idCarrera: number;
    idDepartamento: number;
    idMunicipio: number;
    habilidades: number[];
    idiomas: number[];
    tieneTransporte: boolean; // ✅ NUEVO: Para geografía inteligente
}

export class RecommendationService {

    async getUserProfile(carnet: string): Promise<UserProfile | null> {
        try {
            const pool = await getConnection();

            // Datos básicos del usuario - ACTUALIZADO con transporte
            const userResult = await pool.request()
                .input('carnet', sql.NVarChar(30), carnet)
                .query(`
          SELECT 
            u.idUsuario,
            u.idCarrera,
            u.idDepartamento,
            u.idMunicipio,
            u.tieneTransporte
          FROM usuarios u
          WHERE u.carnet = @carnet AND u.estado = 1
        `);

            if (userResult.recordset.length === 0) {
                console.log('❌ Usuario no encontrado');
                return null;
            }

            const userData = userResult.recordset[0];
            console.log(`✅ Usuario encontrado:`, userData);

            // Habilidades del usuario
            const skillsResult = await pool.request()
                .input('idUsuario', sql.Int, userData.idUsuario)
                .query(`SELECT idHabilidad FROM habilidadesUsuario WHERE idUsuario = @idUsuario`);


            // Idiomas del usuario
            const languagesResult = await pool.request()
                .input('idUsuario', sql.Int, userData.idUsuario)
                .query(`SELECT idIdioma FROM idiomasUsuario WHERE idUsuario = @idUsuario`);


            const profile = {
                idUsuario: userData.idUsuario,
                idCarrera: userData.idCarrera,
                idDepartamento: userData.idDepartamento,
                idMunicipio: userData.idMunicipio,
                tieneTransporte: userData.tieneTransporte || false, // ✅ NUEVO
                habilidades: skillsResult.recordset.map((r: any) => r.idHabilidad),
                idiomas: languagesResult.recordset.map((r: any) => r.idIdioma)
            };

            return profile;

        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            return null;
        }
    }

    calculateProjectScore(project: any, userProfile: UserProfile): number {

        let score = 0;

        const mismoDepartamento = project.idDepartamento === userProfile.idDepartamento;
        const mismoMunicipio = project.idMunicipio === userProfile.idMunicipio;

        if (mismoMunicipio) {
            score += 30;
        } else if (mismoDepartamento) {
            score += 20;
        } else {
            if (userProfile.tieneTransporte) {
                score += 10;
            } else {
                score += 2; // Muy baja prioridad si no tiene transporte
            }
        }

        const tieneCarrerasRequeridas = project.idCarreras && project.idCarreras.length > 0;
        
        if (!tieneCarrerasRequeridas) {
            score += 35;
        } else if (project.idCarreras.includes(userProfile.idCarrera)) {
            score += 25;
        } else {
            score += 5; // Muy baja prioridad
        }

        const tieneHabilidadesRequeridas = project.habilidadesRequeridas && project.habilidadesRequeridas.length > 0;
        
        if (!tieneHabilidadesRequeridas) {
            score += 15;
        } else {
            // Calcular matching de habilidades
            const matchingSkills = project.habilidadesRequeridas.filter((h: number) =>
                userProfile.habilidades.includes(h)
            ).length;
            score += matchingSkills * 5;
        }

        const tieneIdiomasRequeridos = project.idiomasRequeridos && project.idiomasRequeridos.length > 0;
        
        if (!tieneIdiomasRequeridos) {
            score += 10;
        } else {
            // Calcular matching de idiomas
            const matchingLanguages = project.idiomasRequeridos.filter((l: number) =>
                userProfile.idiomas.includes(l)
            ).length;
            score += matchingLanguages * 3;
        }

        if (project.horas <= 50) {
            score += 8;
        } else if (project.horas <= 100) {
            score += 5;
        }

        return score;
    }

    async getRecommendedProjects(carnet: string, allProjects: any[]): Promise<any[]> {

        const userProfile = await this.getUserProfile(carnet);

        if (!userProfile) {
            console.log('❌ Sin perfil, devolviendo proyectos originales');
            return allProjects;
        }

        const enrichedProjects = await this.enrichProjectsData(allProjects);

        const projectsWithScores = enrichedProjects.map(project => {
            const score = this.calculateProjectScore(project, userProfile);
            return { ...project, score };
        });

        // Ordenar por score descendente
        const sorted = projectsWithScores.sort((a, b) => b.score - a.score);


        return sorted.map(({ score, ...project }) => project);
    }

    async enrichProjectsData(projects: any[]): Promise<any[]> {
        const pool = await getConnection();
        const enrichedProjects: any[] = [];

        for (const project of projects) {
            try {

                // Obtener carreras relacionadas
                const careersResult = await pool.request()
                    .input('idProyecto', sql.Int, project.idProyecto)
                    .query('SELECT idCarrera FROM carrerasProyecto WHERE idProyecto = @idProyecto');
                const carreras = careersResult.recordset.map((r: any) => r.idCarrera);

                // Obtener habilidades requeridas
                const skillsResult = await pool.request()
                    .input('idProyecto', sql.Int, project.idProyecto)
                    .query('SELECT idHabilidad FROM habilidadesProyecto WHERE idProyecto = @idProyecto');
                const habilidades = skillsResult.recordset.map((r: any) => r.idHabilidad);

                // Obtener idiomas requeridos
                const languagesResult = await pool.request()
                    .input('idProyecto', sql.Int, project.idProyecto)
                    .query('SELECT idIdioma FROM idiomasProyecto WHERE idProyecto = @idProyecto');
                const idiomas = languagesResult.recordset.map((r: any) => r.idIdioma);

                // Obtener ubicación de la institución
                const locationResult = await pool.request()
                    .input('idProyecto', sql.Int, project.idProyecto)
                    .query(`
          SELECT i.idDepartamento, i.idMunicipio 
          FROM proyectos p 
          INNER JOIN instituciones i ON p.idInstitucion = i.idInstitucion 
          WHERE p.idProyecto = @idProyecto
        `);

                const location = locationResult.recordset[0] || { idDepartamento: null, idMunicipio: null };

                // Mantener TODAS las propiedades originales
                const enriched = {
                    ...project,
                    idCarreras: carreras,
                    idDepartamento: location.idDepartamento,
                    idMunicipio: location.idMunicipio,
                    habilidadesRequeridas: habilidades,
                    idiomasRequeridos: idiomas
                };

                enrichedProjects.push(enriched);

            } catch (error) {
                console.error(`❌ Error enriqueciendo proyecto ${project.idProyecto}:`, error);
                // Si hay error, usar datos básicos pero mantener propiedades originales
                enrichedProjects.push({
                    ...project,
                    idCarreras: [],
                    idDepartamento: null,
                    idMunicipio: null,
                    habilidadesRequeridas: [],
                    idiomasRequeridos: []
                });
            }
        }

        return enrichedProjects;
    }
}