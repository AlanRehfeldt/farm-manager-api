-- Estorno de atividade preserva ActivityLabor. O marcador impede
-- um segundo estorno quando a atividade só tinha hora CLT aberta.
ALTER TABLE "activities" ADD COLUMN "reversedAt" TIMESTAMP(3);
