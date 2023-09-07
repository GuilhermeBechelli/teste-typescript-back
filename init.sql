CREATE DATABASE API;
USE API;
 
CREATE TABLE Contact (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(150),
    Phone VARCHAR(20),
    Email VARCHAR(150),
    Active TINYINT(1) DEFAULT 1
);


CREATE TABLE ContactRelative (
    ContactId INT,
    RelativeId INT,
    Relationship VARCHAR(100),
    Active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (ContactId) REFERENCES Contact(Id),
    FOREIGN KEY (RelativeId) REFERENCES Contact(Id),
    PRIMARY KEY (RelativeId, ContactId, Relationship)
);