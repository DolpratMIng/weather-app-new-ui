-- CreateTable
CREATE TABLE "CurrentWeather" (
    "id" TEXT NOT NULL DEFAULT 'bangkok-current-weather',
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" INTEGER NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastDay" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "maxTemperature" DOUBLE PRECISION NOT NULL,
    "minTemperature" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalDay" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "maxTemperature" DOUBLE PRECISION NOT NULL,
    "minTemperature" DOUBLE PRECISION NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForecastDay_date_key" ON "ForecastDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalDay_date_key" ON "HistoricalDay"("date");
