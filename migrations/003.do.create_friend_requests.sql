create table friend_requests (
	id BIGSERIAL PRIMARY KEY,
	user_id_from INTEGER references users(id) ON DELETE cascade,
	user_id_to INTEGER references users(id) ON DELETE cascade,
	request_status text not null
);
