CREATE TABLE IF NOT EXISTS countries (
    id VARCHAR(50) PRIMARY KEY
);

INSERT INTO countries (id) VALUES
-- SOUTH AMERICA
('ARGENTINA'), ('URUGUAY'), ('CHILE'), ('PERU'), ('COLOMBIA'), ('BRASIL'),

-- NORTH AMERICA
('ALASKA'), ('CANADA'), ('GROENLANDIA'), ('OREGON'), ('TERRANOVA'), ('LABRADOR'), ('CALIFORNIA'),
('MEXICO'), ('NUEVA_YORK'), ('YUKON'),

-- EUROPE
('ISLANDIA'), ('GRAN_BRETANA'), ('ESPANA'), ('FRANCIA'), ('ALEMANIA'), ('ITALIA'), ('POLONIA'), ('SUECIA'), ('RUSIA'),

-- ASIA
('ARAL'), ('TARTARIA'), ('TAMIR'), ('KAMCHATKA'), ('SIBERIA'), ('JAPON'), ('MONGOLIA'),
('IRAN'), ('GOBI'), ('CHINA'), ('TURQUIA'), ('ISRAEL'), ('ARABIA'), ('INDIA'), ('MALASIA'),

-- OCEANIA
('AUSTRALIA'), ('BORNEO'), ('JAVA'), ('SUMATRA'),

-- AFRICA
('MADAGASCAR'), ('EGIPTO'), ('ETIOPIA'), ('ZAIRE'), ('SAHARA'), ('SUDAFRICA');