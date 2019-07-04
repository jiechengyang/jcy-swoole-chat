<?php 

$str = '"a:1:{i:0;a:4:{s:3:"uid";s:38:"{13D73312-CA3B-DBAE-A36F-10AFF213E90C}";s:8:"username";s:6:"jcycms";s:8:"password";s:60:"$2y$09$OIC33E6nQeIXrHkymEkcxerOIwYBEEmEoWe9OodO5TEVVSOuugnwu";s:5:"email";s:8:"1@qq.com";}}"';

var_dump(unserialize($str));