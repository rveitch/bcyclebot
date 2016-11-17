- new bikes available (yes/available)

Alter Tigger: Timeframe

{
station_id: "bcycle_greatrides_2878",
num_bikes_available: 19,
num_docks_available: 11,
is_installed: 1,
is_renting: 1,
is_returning: 1,
last_reported: 1474747959
"new_bikes_available", 1 <----
"num_bikes_available", 3 <----
}


"new_bikes_available", 1 <----
"num_bikes_available", 3 <----

app -> webhook notification alert to zapier -> zapier grabs the callback json -> zapier sends alert

diff function:
- call and cache the status_status json

-------

- return most recent index document (to compare against)
- return the current status
- compare the two
- if (threshold) then send alert
