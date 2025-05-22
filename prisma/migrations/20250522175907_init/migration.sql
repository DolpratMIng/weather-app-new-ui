-- CreateTable
CREATE TABLE "CurrentWeather" (
    "id" SERIAL NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastDay" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
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
    "date" TIMESTAMP(3) NOT NULL,
    "maxTemperature" DOUBLE PRECISION NOT NULL,
    "minTemperature" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "precipitation" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalDay_pkey" PRIMARY KEY ("id")
);
