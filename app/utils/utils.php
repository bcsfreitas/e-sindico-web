<?php
use Slim\Slim;

class Utils {

  const STATUS_PENDENTE_AVALIACAO = "A";
  const STATUS_CADASTRO_REPROVADO = "C";
  const STATUS_PUBLICADO = "P";
  const STATUS_PUBLICADO_DESTACADO = "D";
  const STATUS_RETIRADO = "R";

  static function response( $error = false, $message = '', $data = array(), $code = null) {
    $app = Slim::getInstance();
    $response = new stdClass();
    if($error==true){
    	if(_SLIM_DEBUG){
    		$response->errorLine    = $code;
    	}
    }
    $response->error   = $error;
    $response->message = $message;
    $response->data    = $data;
    $app->response()->header('Content-Type', 'application/json');
    return $app->response()->body( json_encode($response) );
  }

  static function validaCNPJ($cnpj){
    $cnpj = preg_replace('/[^0-9]/', '', (string) $cnpj);
    // Valida tamanho
    if (strlen($cnpj) != 14)
        return false;
    // Valida primeiro dígito verificador
    for ($i = 0, $j = 5, $soma = 0; $i < 12; $i++)
    {
        $soma += $cnpj{$i} * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    $resto = $soma % 11;
    if ($cnpj{12} != ($resto < 2 ? 0 : 11 - $resto))
        return false;
    // Valida segundo dígito verificador
    for ($i = 0, $j = 6, $soma = 0; $i < 13; $i++)
    {
        $soma += $cnpj{$i} * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    $resto = $soma % 11;
    return $cnpj{13} == ($resto < 2 ? 0 : 11 - $resto);
  }
}