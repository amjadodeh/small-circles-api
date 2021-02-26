create table posts (
	id BIGSERIAL PRIMARY KEY,
	content text not null,
	private text,
	user_id INTEGER references users(id) ON DELETE cascade 
);
