create table friend_requests (
	user_id_from INTEGER references users(id) ON DELETE cascade,
	user_id_to INTEGER references users(id) ON DELETE cascade,
	primary key (user_id_from, user_id_to),
	request_status text not null
);
