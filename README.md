# README #
## What is this project? ##
A social network built for my A Level Computer Science Controlled Assessment. 

## About this project ##
The social network is built on Node and MySQL with a plain HTML/Javascript setup running the front end.
The actual project is a 'private' social network. It is built around 'bubbles' - for example, a school could be a bubble and a group of friends could also be a 'bubble'.
Each bubble is isolated and independent from each of the other bubbles. 
By default, when a user signs up he joins a bubble (during sign up). He can join other bubbles later on. 
The person to create the bubble is also the admin - they control what goes on in the bubble: users, posts etc. 

## Database ##
The project utilises MySQL as a backend.

### MySQL Schema ###
## Users Table ##
	CREATE TABLE `hexbubble`.`users` (
	  `userId` INT NOT NULL AUTO_INCREMENT,
	  `email` VARCHAR(320) NOT NULL,
	  `password` CHAR(60) NOT NULL,
	  `name` TINYTEXT NOT NULL,
	  `dateCreated` DATETIME NOT NULL,
	  `profilePicture` VARCHAR(100) NOT NULL,
	  `bio` TEXT NOT NULL,
	  PRIMARY KEY (`userId`),
	  UNIQUE INDEX `userId_UNIQUE` (`userId` ASC),
	  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
	ENGINE = InnoDB;

## Bubbles Table ##
	CREATE TABLE `hexbubble`.`bubbles` (
	  `bubbleId` INT NOT NULL AUTO_INCREMENT,
	  `bubbleName` VARCHAR(255) NOT NULL,
	  `dateCreated` DATETIME NOT NULL,
	  `bubblePicture` VARCHAR(100) NOT NULL,
	  `bio` TEXT NOT NULL,
	  PRIMARY KEY (`bubbleId`),
	  UNIQUE INDEX `bubbleId_UNIQUE` (`bubbleId` ASC),
	  UNIQUE INDEX `name_UNIQUE` (`bubbleName` ASC));

## Members Table ##
	CREATE TABLE `hexbubble`.`members` (
	  `memberId` INT NOT NULL AUTO_INCREMENT,
	  `userId` INT NOT NULL,
	  `bubbleId` INT NOT NULL,
	  `admin` TINYINT NOT NULL,
	  `dateCreated` DATETIME NOT NULL,
	  PRIMARY KEY (`memberId`),
	  UNIQUE INDEX `memberId_UNIQUE` (`memberId` ASC));


