
<?php
echo "<h1>Atualização Dinâmica do Sistema</h1>";
ini_set('max_execution_time',60);
$release = realpath(dirname(__FILE__))."/release.php";
$localDir = realpath(dirname(__FILE__))."/updates/";
$localRootDir = "C:/xampp/htdocs/ex9Condominio";
$currentRelease = file_get_contents($release);
$urlReadReleases = 'http://127.0.0.1/testeUpdate/updates/release.php';
$urlUpdates = 'http://127.0.0.1/testeUpdate/updates';

$updated = false;
$found = false;

//Check for an update. We have a simple file that has a new release version on each line. (1.00, 1.02, 1.03, etc.)
$getVersions = file_get_contents($urlReadReleases) or die ('Erro ao ler lista de versões on-line..');
if ($getVersions != '')
{
    //If we managed to access that file, then lets break up those release versions into an array.
    echo '<p>Versão Atual: '.$currentRelease.'</p>';
    echo '<p>Lendo lista de versões...</p>';
    $versionList = explode("n", $getVersions);    
    foreach ($versionList as $aV)
    {
        if ( $aV > $currentRelease) {
            echo '<p>Nova versão encontrada: '.$aV.'</p>';
            $found = true;
           
            //Download The File If We Do Not Have It
            if ( !is_file(  $urlUpdates.'/'.$aV.'.zip' ) ) {
                echo '<p>Baixando nova atualização...</p>';
                $newUpdate = file_get_contents( $urlUpdates.'/'.$aV.'.zip' );
                if ( !is_dir( $localDir ) ) mkdir ( $localDir );
                $dlHandler = fopen( $localDir.'/'.$aV.'.zip' , 'w');
                if ( !fwrite($dlHandler, $newUpdate) ) { echo '<p> Não foi possível salvar no diretório, opreação cancelada.</p>'; exit(); }
                fclose($dlHandler);
                echo '<p>Download da atualização foi salvo.</p>';
            } else echo '<p>Atualização ainda está baixando...</p>';    
           
            if (isset($_GET['doUpdate']) && $_GET['doUpdate'] == true) {
                //Open The File And Do Stuff
                $zipHandle = zip_open( $localDir.'/'.$aV.'.zip' );
                echo '<ul>';
                while ($aF = zip_read($zipHandle) )
                {
                    $thisFileName = zip_entry_name($aF);
                    $thisFileDir = dirname($thisFileName);
                   
                    //Continue if its not a file
                    if ( substr($thisFileName,-1,1) == '/') continue;
                   
    
                    //Make the directory if we need to...
                    if ( !is_dir ( $localRootDir.'/'.$thisFileDir ) )
                    {
                         mkdir ( $localRootDir.'/'.$thisFileDir );
                         echo '<li>Created Directory '.$thisFileDir.'</li>';
                    }
                   
                    //Overwrite the file
                    if ( !is_dir($localRootDir.'/'.$thisFileName) ) {
                        echo '<li>'.$thisFileName.'...........';
                        $contents = zip_entry_read($aF, zip_entry_filesize($aF));
                        $contents = str_replace("rn", "n", $contents);
                        $updateThis = '';
                       
                        //If we need to run commands, then do it.
                        if ( $thisFileName == 'upgrade.php' )
                        {
                            $upgradeExec = fopen ('upgrade.php','w');
                            fwrite($upgradeExec, $contents);
                            fclose($upgradeExec);
                            include ('upgrade.php');
                            unlink('upgrade.php');
                            echo' EXECUTADO</li>';
                        }
                        else
                        {
                            $updateThis = fopen($localRootDir.'/'.$thisFileName, 'w');
                            fwrite($updateThis, $contents);
                            fclose($updateThis);
                            unset($contents);
                            echo' ATUALIZADO</li>';
                        }
                    }
                }
                echo '</ul>';
                $updated = TRUE;
            }
            else echo '<p>Atualização preparada. <a href="?doUpdate=true">&raquo; JÁ FEZ CÓPIA DE SEGURANÇA? DESEJA INSTALAR AGORA?</a></p>';
            break;
        }
    }
    
    if ($updated == true)
    {
        set_setting('site','CMS',$aV);
        echo '<p class="success">&raquo; Sistema atualizado para a vesão: '.$aV.'</p>';
    }
    else if ($found != true) echo '<p>&raquo; Sua versão está atualizada.</p>';

    
}
else echo '<p>Você está com a versão mais atualizada.</p>';