create table users (
	id BIGSERIAL PRIMARY KEY,
	username text not null unique,
	hash text not null,
	profile_picture text default 'https://i.imgur.com/Mkm3TGW.jpeg' not null,
	friends text
);
