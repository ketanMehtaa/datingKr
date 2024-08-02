CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Location" ADD COLUMN coordinates geometry(Point, 4326);

UPDATE "Location"
SET coordinates = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

CREATE INDEX location_coordinates_idx ON "Location" USING GIST (coordinates);
