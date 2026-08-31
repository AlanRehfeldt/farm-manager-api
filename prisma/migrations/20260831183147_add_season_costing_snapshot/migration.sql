-- CreateTable
CREATE TABLE "season_costing_snapshots" (
    "id" TEXT NOT NULL,
    "cropSeasonId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "closedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_costing_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "season_costing_snapshots_cropSeasonId_key" ON "season_costing_snapshots"("cropSeasonId");

-- CreateIndex
CREATE INDEX "season_costing_snapshots_cropSeasonId_idx" ON "season_costing_snapshots"("cropSeasonId");

-- AddForeignKey
ALTER TABLE "season_costing_snapshots" ADD CONSTRAINT "season_costing_snapshots_cropSeasonId_fkey" FOREIGN KEY ("cropSeasonId") REFERENCES "crop_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_costing_snapshots" ADD CONSTRAINT "season_costing_snapshots_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
