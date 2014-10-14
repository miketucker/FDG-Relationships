<?php
$myFile = 'data.json';
// The new person to add to the file
$data = stripslashes($_POST['data']);
// Write the contents to the file, 
// using the FILE_APPEND flag to append the content to the end of the file
// and the LOCK_EX flag to prevent anyone else writing to the file at the same time
// file_put_contents($file, $data, FILE_APPEND | LOCK_EX);
if($data){
	$fh = fopen($myFile, 'w') or die("can't open file");
	fwrite($fh, $data);
	fclose($fh);
}


?>