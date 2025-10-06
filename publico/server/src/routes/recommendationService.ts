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
            console.log(`🔍 Buscando perfil para carnet: ${carnet}`);
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
                idUsuario: userData.idUsuario,
                idCarrera: userData.idCarrera,
                idDepartamento: userData.idDepartamento,
                idMunicipio: userData.idMunicipio,
                tieneTransporte: userData.tieneTransporte || false, // ✅ NUEVO
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
        console.log(`📍 Ubicación usuario: ${userProfile.idDepartamento}/${userProfile.idMunicipio}`);
        console.log(`🚗 Usuario tiene transporte: ${userProfile.tieneTransporte}`);

        let score = 0;

        // 🗺️ GEORGRAFÍA INTELIGENTE MEJORADA
        const mismoDepartamento = project.idDepartamento === userProfile.idDepartamento;
        const mismoMunicipio = project.idMunicipio === userProfile.idMunicipio;

        if (mismoMunicipio) {
            score += 30;
            console.log(`📍 +30 por mismo municipio`);
        } else if (mismoDepartamento) {
            score += 20;
            console.log(`📍 +20 por mismo departamento`);
        } else {
            // ✅ NUEVO: Si tiene transporte, puede considerar proyectos fuera de su departamento
            if (userProfile.tieneTransporte) {
                score += 10;
                console.log(`🚗 +10 por tener transporte (proyecto fuera de departamento)`);
            } else {
                score += 2; // Muy baja prioridad si no tiene transporte
                console.log(`🚫 +2 por proyecto fuera de departamento sin transporte`);
            }
        }

        // 🎓 CARRERA INTELIGENTE - Proyectos sin requisitos específicos tienen alta prioridad
        const tieneCarrerasRequeridas = project.idCarreras && project.idCarreras.length > 0;
        
        if (!tieneCarrerasRequeridas) {
            // ✅ PROYECTO UNIVERSAL: No requiere carrera específica → ALTA PRIORIDAD
            score += 35;
            console.log(`🌟 +35 por proyecto universal (sin requisitos de carrera)`);
        } else if (project.idCarreras.includes(userProfile.idCarrera)) {
            // Carrera coincide
            score += 25;
            console.log(`🎓 +25 por misma carrera`);
        } else {
            // No coincide con carrera pero el proyecto sí requiere carrera específica
            score += 5; // Muy baja prioridad
            console.log(`📉 +5 por proyecto que requiere carrera diferente`);
        }

        // 🛠️ HABILIDADES - Proyectos sin requisitos tienen prioridad
        const tieneHabilidadesRequeridas = project.habilidadesRequeridas && project.habilidadesRequeridas.length > 0;
        
        if (!tieneHabilidadesRequeridas) {
            // ✅ No requiere habilidades específicas → BONUS
            score += 15;
            console.log(`👍 +15 por proyecto sin requisitos de habilidades`);
        } else {
            // Calcular matching de habilidades
            const matchingSkills = project.habilidadesRequeridas.filter((h: number) =>
                userProfile.habilidades.includes(h)
            ).length;
            score += matchingSkills * 5;
            console.log(`🛠️ +${matchingSkills * 5} por ${matchingSkills} habilidades`);
        }

        // 🗣️ IDIOMAS - Proyectos sin requisitos tienen prioridad
        const tieneIdiomasRequeridos = project.idiomasRequeridos && project.idiomasRequeridos.length > 0;
        
        if (!tieneIdiomasRequeridos) {
            // ✅ No requiere idiomas específicos → BONUS
            score += 10;
            console.log(`🌎 +10 por proyecto sin requisitos de idiomas`);
        } else {
            // Calcular matching de idiomas
            const matchingLanguages = project.idiomasRequeridos.filter((l: number) =>
                userProfile.idiomas.includes(l)
            ).length;
            score += matchingLanguages * 3;
            console.log(`🗣️ +${matchingLanguages * 3} por ${matchingLanguages} idiomas`);
        }

        // ⏰ HORAS - Proyectos con menos horas son más accesibles
        if (project.horas <= 50) {
            score += 8;
            console.log(`⏰ +8 por horas bajas (<=50)`);
        } else if (project.horas <= 100) {
            score += 5;
            console.log(`⏰ +5 por horas moderadas (<=100)`);
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

        console.log('🏆 TOP 5 Proyectos recomendados:');
        sorted.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.titulo} - Score: ${p.score}`);
            
            // Debug info
            const mismoDepto = p.idDepartamento === userProfile.idDepartamento;
            const mismoMuni = p.idMunicipio === userProfile.idMunicipio;
            const sinCarrera = !p.idCarreras || p.idCarreras.length === 0;
            const sinHabilidades = !p.habilidadesRequeridas || p.habilidadesRequeridas.length === 0;
            const sinIdiomas = !p.idiomasRequeridos || p.idiomasRequeridos.length === 0;
            
            console.log(`   📍 Ubicación: ${mismoMuni ? 'Mismo municipio' : mismoDepto ? 'Mismo depto' : 'Fuera de depto'}`);
            console.log(`   🎓 Tipo: ${sinCarrera ? 'UNIVERSAL' : 'Específico'}`);
            console.log(`   🛠️ Habilidades: ${sinHabilidades ? 'Ninguna requerida' : p.habilidadesRequeridas.length + ' requeridas'}`);
            console.log(`   🗣️ Idiomas: ${sinIdiomas ? 'Ninguno requerido' : p.idiomasRequeridos.length + ' requeridos'}`);
        });

        return sorted.map(({ score, ...project }) => project);
    }

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

                // Mantener TODAS las propiedades originales
                const enriched = {
                    ...project,
                    idCarreras: carreras,
                    idDepartamento: location.idDepartamento,
                    idMunicipio: location.idMunicipio,
                    habilidadesRequeridas: habilidades,
                    idiomasRequeridos: idiomas
                };

                console.log(`✅ Proyecto enriquecido:`, {
                    id: enriched.idProyecto,
                    titulo: enriched.titulo,
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