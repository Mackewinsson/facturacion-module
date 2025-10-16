<?php
$ftp_server = "192.168.8.10";
$ftp_user_name = "usermw";
$ftp_user_pass = "usermw";

function subirFtp($nOt, $sourceFile, $destinationFile) {
	global $ftp_server, $ftp_user_name, $ftp_user_pass;
	
	// conexión
	$conn_id = ftp_connect($ftp_server); 
	 
	// logeo
	$login_result = ftp_login($conn_id, $ftp_user_name, $ftp_user_pass); 
	 
	// conexión
	if ((!$conn_id) || (!$login_result)) { 
		   echo "Conexión al FTP con errores!";
		   echo "Intentando conectar a $ftp_server for user $ftp_user_name"; 
		   exit; 
	   } else {
		   echo "Conectado a $ftp_server, for user $ftp_user_name";
	   }

    if (ftp_mkdir($conn_id, strtoupper($nOt))) {
		echo "Creado con éxito el directorio.";
	} else {
		echo "Ha habido un problema en la creación.";
	}
	
	// archivo a copiar/subir
	$upload = ftp_put($conn_id, $destinationFile, $sourceFile, FTP_BINARY);
	 
	// estado de subida/copiado
	if (!$upload) { 
		   echo "Error al subir el archivo!";
	   } else {
		   echo "Archivo $source_file se ha subido exitosamente a $ftp_server en $destination_file";
	   }
	 
	// cerramos
	ftp_close($conn_id);
}

function descargarFtp($nOt) {
	global $ftp_server, $ftp_user_name, $ftp_user_pass;
	
	$destination_file = "/imgdmg.png";
	// conexión
	$conn_id = ftp_connect($ftp_server); 
	
	// Respuesta de la función
	$res = false;
	
	// logeo
	$login_result = ftp_login($conn_id, $ftp_user_name, $ftp_user_pass); 
	 
	// conexión
	if ((!$conn_id) || (!$login_result)) { 
		return false;
		exit; 
	}

	//if (ftp_chdir($conn_id, $nOt)) {
	try{
		if (is_dir(strtoupper($nOt))) {
			if (ftp_get($conn_id,"./".$nOt."/img/imgdmg.png","imgdmg.png", FTP_ASCII, 0)) {
				$res = true;
			} else {
				$res = false;
			}
		}
		else {
			$res = false;
		}
	}
	catch (Exception $e) {
		$res = false;
	}
	//} else { 
	//	echo "No existe carpeta $nOt";
	//	return false;
	//	exit;
	//}
	// cerramos
	ftp_close($conn_id);
	return $res;
}

?>