
use note;

delimiter //
CREATE FUNCTION `f_lng_lat_distance` (lng1 FLOAT, lat1 FLOAT, lng2 FLOAT, lat2 FLOAT) RETURNS INT COMMENT '计算经纬度距离' DETERMINISTIC
BEGIN
	RETURN FLOOR(6378138 * 2 * ASIN(SQRT(POW(SIN((lat1 * PI() / 180 - lat2 * PI() / 180) / 2), 2) + COS(lat1 * PI() / 180) * COS(lat2 * PI() / 180) * POW(SIN(( lng1 * PI() / 180 - lng2 * PI() / 180 ) / 2), 2))));
END //
delimiter ;
drop function f_lng_lat_distance;

show function status;

select * from locations;

select userId, distance, username, nickname, portrait, sex from (select userId, f_lng_lat_distance(114.036362, 22.621605, longitude, latitude) as distance from locations where userId != 1) as dist, users where users.id = dist.userId limit 1 offset 2;