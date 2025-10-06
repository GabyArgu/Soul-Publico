// services/recommendationService.ts - Machine Learning UwU
import { getConnection, sql } from "../db";

interface UserProfile {
    idUsuario: number; // ✅ AÑADIR
    idCarrera: number;
    idDepartamento: number;
    idMunicipio: number;
    habilidades: number[];
    idiomas: number[];
}

export class RecommendationService {

    async getUserProfile(carnet: string): Promise<UserProfile | null> {
        try {
            console.log(`🔍 Buscando perfil para carnet: ${carnet}`);
            const pool = await getConnection();

            // Datos básicos del usuario - CORREGIDO
            const userResult = await pool.request()
                .input('carnet', sql.NVarChar(30), carnet)
                .query(`
          SELECT 
            u.idUsuario,  -- ✅ AÑADIDO
            u.idCarrera,
            u.idDepartamento,
            u.idMunicipio
          FROM usuarios u
          WHERE u.carnet = @carnet AND u.estado = 1
        `);

            console.log(`📊 Resultado usuario:`, userResult.recordset);

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

            console.log(`🛠️ Habilidades:`, skillsResult.recordset);

            // Idiomas del usuario
            const languagesResult = await pool.request()
                .input('idUsuario', sql.Int, userData.idUsuario)
                .query(`SELECT idIdioma FROM idiomasUsuario WHERE idUsuario = @idUsuario`);

            console.log(`🗣️ Idiomas:`, languagesResult.recordset);

            const profile = {
                idUsuario: userData.idUsuario, // ✅ AÑADIDO
                idCarrera: userData.idCarrera,
                idDepartamento: userData.idDepartamento,
                idMunicipio: userData.idMunicipio,
                habilidades: skillsResult.recordset.map((r: any) => r.idHabilidad),
                idiomas: languagesResult.recordset.map((r: any) => r.idIdioma)
            };

            console.log(`🎯 Perfil completo:`, profile);
            return profile;

        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            return null;
        }
    }

    calculateProjectScore(project: any, userProfile: UserProfile): number {
        console.log(`📊 Calculando score para proyecto ${project.idProyecto}`);

        let score = 0;

        // Misma ubicación
        if (project.idDepartamento === userProfile.idDepartamento) {
            score += 30;
            console.log(`📍 +30 por mismo departamento`);
            if (project.idMunicipio === userProfile.idMunicipio) {
                score += 20;
                console.log(`📍 +20 por mismo municipio`);
            }
        }

        // Coincidencia de carrera
        if (project.idCarreras.includes(userProfile.idCarrera)) {
            score += 25;
            console.log(`🎓 +25 por misma carrera`);
        }

        // Coincidencia de habilidades
        const matchingSkills = project.habilidadesRequeridas.filter((h: number) =>
            userProfile.habilidades.includes(h)
        ).length;
        score += matchingSkills * 5;
        console.log(`🛠️ +${matchingSkills * 5} por ${matchingSkills} habilidades`);

        // Coincidencia de idiomas
        const matchingLanguages = project.idiomasRequeridos.filter((l: number) =>
            userProfile.idiomas.includes(l)
        ).length;
        score += matchingLanguages * 3;
        console.log(`🗣️ +${matchingLanguages * 3} por ${matchingLanguages} idiomas`);

        // Horas
        if (project.horas <= 50) {
            score += 5;
            console.log(`⏰ +5 por horas bajas`);
        }

        console.log(`🎯 Score final: ${score}`);
        return score;
    }

    async getRecommendedProjects(carnet: string, allProjects: any[]): Promise<any[]> {
        console.log(`🚀 Iniciando recomendaciones para: ${carnet}`);
        console.log(`📦 Proyectos a evaluar: ${allProjects.length}`);

        const userProfile = await this.getUserProfile(carnet);

        if (!userProfile) {
            console.log('❌ Sin perfil, devolviendo proyectos originales');
            return allProjects;
        }

        console.log('🎯 Enriqueciendo proyectos...');
        const enrichedProjects = await this.enrichProjectsData(allProjects);

        console.log('📊 Calculando scores...');
        const projectsWithScores = enrichedProjects.map(project => {
            const score = this.calculateProjectScore(project, userProfile);
            return { ...project, score };
        });

        // Ordenar por score descendente
        const sorted = projectsWithScores.sort((a, b) => b.score - a.score);

        console.log('🏆 Proyectos ordenados:');
        sorted.forEach((p, i) => {
            console.log(`${i + 1}. ${p.titulo} - Score: ${p.score}`);
        });

        return sorted.map(({ score, ...project }) => project);
    }

    // En recommendationService.ts - Machine Learning
    async enrichProjectsData(projects: any[]): Promise<any[]> {
        console.log(`🔍 Enriqueciendo ${projects.length} proyectos`);
        const pool = await getConnection();
        const enrichedProjects: any[] = [];

        for (const project of projects) {
            try {
                console.log(`📋 Procesando proyecto: ${project.idProyecto} - ${project.titulo}`);

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

                // ✅ CORREGIDO: Mantener TODAS las propiedades originales
                const enriched = {
                    ...project, // ✅ ESTO ES LO MÁS IMPORTANTE
                    idCarreras: carreras,
                    idDepartamento: location.idDepartamento,
                    idMunicipio: location.idMunicipio,
                    habilidadesRequeridas: habilidades,
                    idiomasRequeridos: idiomas
                };

                console.log(`✅ Proyecto enriquecido:`, {
                    id: enriched.idProyecto,
                    titulo: enriched.titulo, // ✅ Ahora debería tener título
                    carreras: enriched.idCarreras.length,
                    habilidades: enriched.habilidadesRequeridas.length,
                    idiomas: enriched.idiomasRequeridos.length,
                    ubicacion: `${enriched.idDepartamento}/${enriched.idMunicipio}`
                });

                enrichedProjects.push(enriched);

            } catch (error) {
                console.error(`❌ Error enriqueciendo proyecto ${project.idProyecto}:`, error);
                // Si hay error, usar datos básicos pero mantener propiedades originales
                enrichedProjects.push({
                    ...project, // ✅ Mantener propiedades originales
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