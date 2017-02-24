<?php

# === api
# ==================================================

// Função para deletar a categoria
// Parâmetros: id_categoria
// Table: tb_categoria
$app->delete('/categoria/del', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

   try{
     $results = Categoria::findOrFail($data['id_categoria']);
   }catch(\Exception $e){
        return Utils::response(true,"Categoria não existe",null);
   }

   $results = Categoria::where('id_categoria','=',$data['id_categoria'])->delete(); 
   
   if ($results == 1) {
       return Utils::response(false,"Categoria excluida", $results);
   }else {
       return Utils::response(true,"Categoria excluida", null);
   }

});

// Função para editar a categoria
// Parâmetros: id_categoria
// Table: tb_categoria
$app->put('/categoria/update', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    try{
         $results = Categoria::findOrFail($data['id_categoria']);
    }catch(\Exception $e){
        return Utils::response(true,"Categoria não existe",null);
    }
    

    if (isset($data['tx_descricao'] ) ){
        $results->tx_descricao = $data['tx_descricao'];
    }

    if (isset($data['tx_status'] ) ) {
        $results->tx_status = $data['tx_status'];
    }


    if ($results->push()){
        return Utils::response(false,"Categoria atualizada",$results);
    }else {
        return Utils::response(true,"Categoria não existe",null);
    }
});

// Função para adicionar categoria
// Parâmetros: id_categoria
// Table: tb_categoria
$app->post('/categoria/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_descricao']) 
        || !isset($data['tx_status']) 
        ) {
        return Utils::response(true, "Parâmetro(s) inválido(s)", null, __LINE__);
    }

    $n = new Categoria;
    $n->tx_descricao = $data['tx_descricao'];
    $n->tx_status    = $data['tx_status'];

    //$n->subcategoria()->save(Subcategoria::find(1));

    if ($n->save()) {
        return Utils::response(false, "Categoria adicionada", $n);
    } else {
        return Utils::response(true, "Erro na criação da categoria", null, __LINE__);
    }
});

// Função para remover ligação entre categoria e fornecedor
// Parâmetros: id_subcategoria, id_categoria e id_pessoa_fornecedor
// Table: tb_subcategoriafornecedor
$app->delete('/categoriafornecedor/remove', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);
   
    $results = FornecedorSubcategoria::where('id_subcategoria','=', $data['id_subcategoria'])
    ->where('id_categoria','=', $data['id_categoria'])
    ->where('id_pessoa_fornecedor','=', $data['id_pessoa_fornecedor'])->first();
    
    if ( $results == null || $results->count() == 0) {
        return Utils::response(true, "Categoria inexistente", null, __LINE__);
    }


    $results = FornecedorSubcategoria::where('id_subcategoria','=', $data['id_subcategoria'])
    ->where('id_categoria','=', $data['id_categoria'])
    ->where('id_pessoa_fornecedor','=', $data['id_pessoa_fornecedor'])->delete();

    if ( $results == null ){
        return Utils::response(true, "Erro ao excluir categoria", null, __LINE__);
        
    }else {
        return Utils::response(false, "Subcategoria e categoria excluida removida", $results);
    }
    
});

// Função para criar ligação entre categoria, subcategoria e fornecedor
// Parâmetros: id_subcategoria, id_categoria, id_pessoa_fornecedor e tx_status
// Table: tb_subcategoriafornecedor
$app->post('/categoriafornecedor/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);
   
    if (!isset($data['id_categoria'])    ||
        !isset($data['id_subcategoria']) ||
        !isset($data['id_pessoa_fornecedor']) ||
        !isset($data['tx_status'] ) ){
        return Utils::response(true, "Parâmetro(s) inválidos -> VAZIO", null, __LINE__);
    }

    $sf = new FornecedorSubcategoria();
    $sf->id_categoria = $data['id_categoria'];
    $sf->id_subcategoria = $data['id_subcategoria'];
    $sf->id_pessoa_fornecedor = $data['id_pessoa_fornecedor'];
    $sf->tx_status = $data['tx_status'];

    if ( $sf->save() ){
        return Utils::response(false, "Subcategoria e categoria vinculada com sucesso", null);
    }else {
        return Utils::response(true, "Erro ao adicionar subcategoria", null, __LINE__);
    }
    
});
    
// Função para listar todas categorias
// Parâmetros: vazio
// Table: tb_categoria
$app->get('/categoria/listall', function() use ($app) {
    $results = Categoria::all();
    return Utils::response(false, null, $results);
});

// Função para listar todas categorias por fornecedor de serviço
// Parâmetros: id_fornecedor
// Table: tb_categoria, tb_subcategoria_fornecedor
$app->get('/categoriafornecedor/listaCategoria/:id_fornecedor', function($id_fornecedor) use ($app) {
    $result = Categoria
    ::join('tb_subcategoria_fornecedor', 'tb_subcategoria_fornecedor.id_categoria', '=', 'tb_categoria.id_categoria')
    ->select('tb_categoria.id_categoria','tb_categoria.tx_descricao', 'tb_categoria.tx_status')
    ->where('tb_subcategoria_fornecedor.id_pessoa_fornecedor', $id_fornecedor)        
    ->getQuery() // Optional: downgrade to non-eloquent builder so we don't build invalid User objects.
    ->distinct()
    ->get();

    if ($result == null) {
        return Utils::response(true,"Não há categorias vinculadas a este fornecedor", null);
    }

    return Utils::response(false, null, $result);
});

// Função para listar todos fornecedores por categoria
// Parâmetros: id_categoria
// Table: tb_fornecedor, tb_subcategoria_fornecedor
$app->get('/categoriafornecedor/listaFornecedores/:id_categoria', function($id_categoria) use ($app) {
    
    $fornecedores = Fornecedor
    ::join('tb_subcategoria_fornecedor', 'tb_subcategoria_fornecedor.id_pessoa_fornecedor', '=', 'tb_fornecedor.id_pessoa')
    ->join('tb_categoria', 'tb_categoria.id_categoria', '=', 'tb_subcategoria_fornecedor.id_categoria')
    ->join('tb_pessoa','tb_pessoa.id_pessoa','=', 'tb_fornecedor.id_pessoa')
    ->select('tb_fornecedor.id_pessoa','tb_fornecedor.tx_razao_social', 'tb_fornecedor.tx_nm_fantasia', 'tb_fornecedor.tx_nm_contato','tb_pessoa.tx_foto')
    ->where('tb_categoria.id_categoria', $id_categoria)  
    ->distinct()      
    ->getQuery() // Optional: downgrade to non-eloquent builder so we don't build invalid User objects.
    ->get();

    if ($fornecedores == null) {
        return Utils::response(true,"Não há fornecedores para essa categoria", null);
    } 

    return Utils::response(false, null, $fornecedores);
});

// Função para listar todos fornecedores por subcategorias
// Parâmetros: id_categoria
// Table: tb_fornecedor, tb_subcategoria_fornecedor
$app->post('/categoriafornecedor/listaFornecedorPorSubcat', function() use ($app) {
        
        $json = $app->request->getBody();
        $data = json_decode($json, true);

        $userArray = [];

        foreach ($data['id_arrays'] as $id ) {
           $userArray[] = $id;
        }
    
        $userArray = array_map(function ($value) {
            return (int) $value;
        }, $userArray);    

        $result = Fornecedor
            ::join('tb_subcategoria_fornecedor', 'tb_subcategoria_fornecedor.id_pessoa_fornecedor', '=', 'tb_fornecedor.id_pessoa')
            ->join('tb_categoria', 'tb_categoria.id_categoria', '=', 'tb_subcategoria_fornecedor.id_categoria')
            ->select('tb_fornecedor.id_pessoa','tb_fornecedor.tx_razao_social', 'tb_fornecedor.tx_nm_fantasia', 'tb_fornecedor.tx_nm_contato')
            ->whereIn('tb_subcategoria_fornecedor.id_subcategoria', $userArray)  
            ->distinct()      
            ->getQuery() 
            ->get();

        return Utils::response(false, "", $result);
   
});

// Função para adicionar uma Pessoa 
// Parâmetros: tx_email, tx_senha, tx_foto, id_nivel
// Table: tb_pessoa
$app->delete('/pessoa/remove', function() use ($app) {
    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_email'])) {
        return Utils::response(true, "Parâmetro \"tx_email\" requerido", null, __LINE__);
    }

    try {
        $pessoa = Pessoa::where('tx_email','=',$data['tx_email'])->first();
    }catch(\Exception $e) {
        return Utils::response(true, "Pessoa não encontrada pelo e-mail.", null, __LINE__); 
    }

    if ($pessoa->delete()) {
        return Utils::response(false, "Pessoa removida", $pessoa);
    } else {
        return Utils::response(true, "Erro na exclusão da pessoa", null, __LINE__);
    }
});

// Função para adicionar uma Pessoa 
// Parâmetros: tx_email, tx_senha, tx_foto, id_nivel
// Table: tb_pessoa
$app->post('/pessoa/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if ( !isset($data['tx_senha']) ){
        return Utils::response(true, "Parâmetro de senha não enviado!", null, __LINE__);
    }

    if( !isset($data['tx_email']) ){
        return Utils::response(true, "Parâmetro de e-mail não enviado!", null, __LINE__);
    }

    $n = new Pessoa();
    $n->tx_email = $data['tx_email'];
    $n->tx_senha = $data['tx_senha'];
    // A foto usa outro serviço
    //$n->tx_foto  = $app->request->post('tx_foto');
    $n->id_nivel = 1;

    if ($n->save()) {
        return Utils::response(false, "Pessoa adicionada", $n);
    } else {
        return Utils::response(true, "Erro na criação da pessoa", null, __LINE__);
    }
});

// Função para listar todas as pessoas
// Parâmetros: 
// Table: tb_pessoa
$app->get('/pessoa/listall(/:id_nivel)', function($id_nivel=-1) use ($app) {
    
    if ($id_nivel != -1 ){
        $results = Pessoa::where('id_nivel','=',$id_nivel)->get();
    }else {
        $results = Pessoa::all();
    }

    return Utils::response(false, null, $results);
});


// Função para alterar senha do usuário todas as pessoas
// Parâmetros: nova senha, senha antiga, confirmacao da senha
// Table: tb_pessoa
$app->put('/pessoa/changepassword', function() use ($app) {
    
    $json = $app->request->getBody();
    $data = json_decode($json, true);
   
    if(isset($data['id_pessoa'])){
        try {
            $pessoa = Pessoa::findOrFail($data['id_pessoa']);
            $senha = $pessoa->tx_senha;
        }catch(\Exception $e) {
            return Utils::response(true, "Pessoa não encontrada pelo id.", null, __LINE__); 
        }
    }else if(isset($data['tx_email'])){
        try {
            $pessoa = Pessoa::where('tx_email','=',$data['tx_email'])->first();
        }catch(\Exception $e) {
            return Utils::response(true, "Pessoa não encontrada pelo e-mail.", null, __LINE__); 
        }
    }else{
        return Utils::response(true,"Nenhuma identificação de usuário foi passada (e-mail ou id_pessoa).",null, __LINE__);
    }

    if (isset($data['tx_senhaantiga'])) {
        if (strcmp($data['tx_senhaantiga'], $pessoa->tx_senha) == 0) {
            if (isset($data['tx_novasenha'])) {
                $pessoa->tx_senha = $data['tx_novasenha'];
                if ( $pessoa-> save()) {
                    return Utils::response(false,"Senha alterada com sucesso!",$pessoa);
                }else {
                    return Utils::response(true,"Erro ao alterar senha", null, __LINE__);
                }            
            }
        }else {
            return Utils::response(true,"Senhas não conferem",null, __LINE__);
        }
    } else {
        return Utils::response(true,"Pessoa não existe",null, __LINE__);
    }
});


$app->get('/categoria/subcategorias', function() use ($app) {

    $categorias = Categoria::all();
    $resultado = [];

    foreach ($categorias as $cat) {
        
        $subcat = Subcategoria::where('id_categoria','=',$cat->id_categoria)->get();
        $catArray = $cat->toArray();
        $catArray['subcategorias'] = $subcat->toArray();
        $resultado[] = $catArray;
         
    }

    return Utils::response(false,$resultado,null);
});


// Função para inserir uma foto de usuário
// Parâmetros: imagem (binário),nome, id_pessoa 
// Table: tb_pessoa
$app->post('/pessoa/uploadPhoto/:id_pessoa', function ($id_pessoa) use ($app) {
    
    $pessoa = Pessoa::where('id_pessoa','=',$id_pessoa)->first();

    try {
        // Path to move uploaded files
        $target_path = "img/";
        $response = array();
        $server_ip = gethostbyname(gethostname());
        $server_ip = '10.0.1.53';
        $file_upload_url = 'http://' . $server_ip . '/' . 'esindico' . '/' . $target_path;

        if (isset($_FILES['image']['name'])) {

            $target_path = $target_path . basename($_FILES['image']['name']);

            $response['file_name'] = basename($_FILES['image']['name']);
            //$response['file_name'] = substr($response['file_name'], -4);

            $nomeImg = "usuario" . $response['file_name'];
            try {
                if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                    $response['error'] = true;
                    $response['message'] = 'Could not move the file!';
                    $app->response->setStatus(404);
                    $app->response()->headers->set('Content-Type', 'application/json');


                    return Utils::response(true, "Não foi possível inserir/atualizar sua imagem do perfil", null,__LINE__); 
                }

                // File successfully uploaded
                $response['message'] = 'File uploaded successfully!';
                $response['error'] = false;
                $response['file_path'] = $file_upload_url . basename($_FILES['image']['name']);


                $app->response->setStatus(200);
                $app->response()->headers->set('Content-Type', 'application/json');

               // echo json_encode(array("sucess" => true, "file_path" => $response['file_path']));
                $pessoa->tx_foto = $response['file_path'];
                if ($pessoa-> push()){
                    return Utils::response(false,"Foto inserida com sucesso!", $pessoa); 
                }

            } catch (Exception $e) {
                // Exception occurred. Make error flag true
                $response['error'] = true;
                $response['message'] = $e->getMessage();
                $app->response->setStatus(404);
                $app->response()->headers->set('Content-Type', 'application/json');

                return Utils::response(true, $response['message'], null,__LINE__); 
            }
        } else {
            // File parameter is missing
            $response['error'] = true;
            $response['message'] = 'Not received any file!F';
            $app->response->setStatus(404);
            $app->response()->headers->set('Content-Type', 'application/json');

            return Utils::response(true, "O arquivo não foi enviado!", null,__LINE__); 
        }
    } catch (PDOException $e) {
        $app->response()->setStatus(404);
        echo '{"error":{"text":' . $e->getMessage() . '}}';
    }
   
});

function reArrayFiles(&$file_post) {

    $file_ary = array();
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}

// Função para apagar um documento para um determinado fornecedor
// Parâmetros: id_documento, id_pessoa_fornecedor
// Table: tb_documento
$app->delete('/fornecedor/document/delete', function () use ($app) {
    $json = $app->request->getBody();
    $data = json_decode($json, true);

    $results = Documento::where('id', '=', $data['id_documento'])->delete();

    if( $results == null ){
        return Utils::response(true, "Erro ao excluir documento", null, __LINE__);
    }else {
        return Utils::response(false, "Documento excluído", $results);
    }
});

// Função para inserir um documento para um determinado fornecedor
// Parâmetros: documento (binário), id_fornecedor
// Table: tb_documento
$app->post('/fornecedor/uploadDocument/:id_fornecedor', function ($id_fornecedor) use ($app) {
    
    try {
        // Path to move uploaded files
        $target_path = "uploads/";
        $response = array();
        $server_ip = gethostbyname(gethostname());
        $server_ip = '10.0.1.53';
        $file_upload_url = 'http://' . $server_ip . '/' . 'esindico' . '/' . $target_path;

        if (isset($_FILES['image']['name'])) {

            $target_path = $target_path . basename($_FILES['image']['name']);

            $response['file_name'] = basename($_FILES['image']['name']);
            //$response['file_name'] = substr($response['file_name'], -4);

            $nomeImg = "usuario" . $response['file_name'];
            try {
                if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                    $response['error'] = true;
                    $response['message'] = 'Could not move the file!';
                    $app->response->setStatus(404);
                    $app->response()->headers->set('Content-Type', 'application/json');

                    return Utils::response(true, "Não foi possível inserir/atualizar sua imagem do perfil", null,__LINE__); 
                }

                // File successfully uploaded
                $response['message'] = 'File uploaded successfully!';
                $response['error'] = false;
                $response['file_path'] = $file_upload_url . basename($_FILES['image']['name']);


                $app->response->setStatus(200);
                $app->response()->headers->set('Content-Type', 'application/json');

               // echo json_encode(array("sucess" => true, "file_path" => $response['file_path']));
               //            return Utils::response(false,"Documento inserido com sucesso!", $response['file_path']); 

                $nome = $app->request()->headers()->get('tx-nome');;

                $d = new Documento();
                $d->tx_caminho = $response['file_path'];
                $d->id_pessoa_fornecedor = $id_fornecedor;
                $d->tx_nome = $nome;
                $d->tx_descricao = $app->request()->headers()->get('tx-descricao');
                $d->tx_tamanho = $_FILES['image']['size'];
                
                if ( $d->save() ){
                    return Utils::response(false,"Documento \"".$nome."\" inserido com sucesso!", $d); 
                }


            } catch (Exception $e) {
                // Exception occurred. Make error flag true
                $response['error'] = true;
                $response['message'] = $e->getMessage();
                $app->response->setStatus(404);
                $app->response()->headers->set('Content-Type', 'application/json');

                return Utils::response(true, $response['message'], null,__LINE__); 
            }
        } else {
            // File parameter is missing
            $response['error'] = true;
            $response['message'] = 'Not received any file!F';
            $app->response->setStatus(404);
            $app->response()->headers->set('Content-Type', 'application/json');

            return Utils::response(true, "O arquivo não foi enviado!", null,__LINE__); 
        }
    } catch (PDOException $e) {
        $app->response()->setStatus(404);
        echo '{"error":{"text":' . $e->getMessage() . '}}';
    }
   
});


// Função para testar retorno do ws
// Parâmetros: -
// Table: -
$app->post('teste', function() use ($app) {
    echo "eae";
});


// Função para editar um usuãrio em especĩfico
// Parâmetros: id_pessoa, tx_email, tx_foto, tx_cidade, tx_cep, tx_logradouro, tx_uf, 
// Table: tb_pessoa, tb_endereco
$app->put('/pessoa/update/', function() use ($app) {
    
    $json = $app->request->getBody();
    $data = json_decode($json, true);
    
    try {
        $resource = Pessoa::findOrFail($data['id_pessoa']);
    }catch(\Exception $e) {
        return Utils::response(true, "Pessoa não encontrada.", null); 
    }


    if ( isset($data['tx_nome'] ) ){
         $resource->tx_nome = $data['tx_nome'];
    }

    if ( isset($data['tx_email'] ) ){
         $resource->tx_email = $data['tx_email'];
    }

    if ( isset($data['alter_pass'] ) ){
        if ( isset($data['tx_senha'] ) ){
            $resource->tx_senha = $data['tx_senha'];
        }else{
            return Utils::response(true, "Senha não foi definida.", null); 
        }
    }


    if( isset($data['tx_logradouro']) ){

        $e = Endereco::where('id_pessoa','=', $resource->id_pessoa )->first();

        if ($e == null || $e->count() == 0) {
            return Utils::response(true, "Endereço não encontrado", null); 
        }

        if ( isset($data['tx_cidade'] ) ){
            $e->tx_cidade = $data['tx_cidade'];
        }

        if ( isset($data['tx_logradouro']) ){
            $e->tx_logradouro = $data['tx_logradouro'];
        }

        if ( isset($data['tx_cep'] ) ) {
            $e->tx_cep = $data['tx_cep'];
        } 

        if ( isset($data['tx_uf']) ) {
            $e->tx_uf = $data['tx_uf'];
        }

        $e->push();
    }

    if( $resource->push() ){
        return Utils::response(false, "Usuário atualizado ");
    }
});

// Função para buscar uma pessoa por id_pessoa
// Parâmetros: id_pessoa
// Table: tb_pessoa
$app->get('/pessoa/listaPessoaId/:id_pessoa', function($id) use ($app) {
    $pessoa = Pessoa::find($id);

    if ($pessoa == null){
       return Utils::response(true, "Pessoa não encontrada",null); 
    }

    return Utils::response(false, null, $pessoa);
});


// Função para buscar um fornecedor por id_pessoa
// Parâmetros: id_pessoa
// Table: tb_pessoa
$app->get('/fornecedor/listaPessoaId/:id_pessoa', function($id) use ($app) {
    $results = Fornecedor::where('id_pessoa', '=', $id)->first();

    if ($results == null){
       return Utils::response(true, "Fornecedor não encontrada",null); 
    }else{
        $pessoa = Pessoa::find($id);
        $results['pessoa'] = $pessoa->toArray();

        if($results['tx_destaque_ativo']=="N"){
            $results['tx_destaque_ativo'] = false;
        }else{
            $results['tx_destaque_ativo'] = true;
        }

        $subcategorias = FornecedorSubcategoria::where('id_pessoa_fornecedor', '=', $id)->get();
        $results['subcategorias'] = $subcategorias->toArray();

        $documentos = Documento::where('id_pessoa_fornecedor', '=', $id)->get();
        if($documentos!=null){
            $results['documentos'] = $documentos->toArray();
        }

        $endereco = Endereco::where('id_pessoa', '=', $id)->first();
        if($endereco!=null){
            $results['endereco'] = $endereco->toArray();        
        }
    }

    return Utils::response(false, null, $results);
});

// Função para vincular várias subcategorias a um fornecedor
// Parâmetros: array_ids
// Table: tb_fornecedorsubcategoria
$app->post('/fornecedor/addSubcategorias', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true); 

    if (!isset($data['id_pessoa_fornecedor'])){
        return Utils::response(true, "Parâmetro id_pessoa_fornecedor deve ser preenchido.", null, __LINE__);
    }

    $results = [];

    if(isset($data['array_ids']) ){

        // APAGA TUDO ANTES DE ADICIONAR, ISSO GARANTIRÁ UM UPDATE CORRETO!
        FornecedorSubcategoria::where('id_pessoa_fornecedor','=', $data['id_pessoa_fornecedor'])->delete();

        foreach ($data['array_ids'] as $id) {

                $s = Subcategoria::findOrFail($id);                 
                $fs = new FornecedorSubcategoria();
                $fs->id_pessoa_fornecedor = $data['id_pessoa_fornecedor'];
                $fs->id_categoria = $s->id_categoria;
                $fs->id_subcategoria = $s->id_subcategoria;
                $fs->tx_status = "P";
            
                $array = ['id_pessoa_fornecedor'=> $data['id_pessoa_fornecedor'] ,
                              'id_categoria' => $fs->id_categoria ,
                              'id_subcategoria' => $fs->id_subcategoria, 
                              'tx_status' => 'P'];

                $results[] = $array;    
         } 

         $result = FornecedorSubcategoria::insert($results);

         if ($result == null){
             return Utils::response(true, "Erro ao vincular subcategorias!", $results,__LINE__);
         }else {
             return Utils::response(false, "Subcategorias vinculadas com sucesso!", $results);
         }
    }else {
        return Utils::response(true, "Parametro inválido", $results, __LINE__);
    }
});


// Função para adicionar um fornecedor
// Parâmetros: pessoa, nu_cnpj, tx_razao_social, tx_nm_fantasia, tx_nm_contato, tx_status
// Table: tb_pessoa, tb_endereco, tb_fornecedor
$app->post('/fornecedor/add', function() use ($app) {
    
    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_email'])) {
        return Utils::response(true, "Parâmetro(s) tx_email inválido(s)", null, __LINE__);
    }

    if (!isset($data['tx_senha'])) {
        return Utils::response(true, "Parâmetro(s) tx_senha inválido(s)", null, __LINE__);
    }

    if (!isset($data['tx_razao_social'])) {
        return Utils::response(true, "Parâmetro(s) tx_razao_social inválido(s)", null, __LINE__);
    }

    if (!isset($data['tx_nm_fantasia'])) {
        return Utils::response(true, "Parâmetro(s) tx_nm_fantasia inválido(s)", null, __LINE__);
    }

    if (!isset($data['tx_nm_contato'])) {
        return Utils::response(true, "Parâmetro(s) tx_nm_contato inválido(s)", null, __LINE__);
    }

    if (!isset($data['tx_status'])) {
        return Utils::response(true, "Parâmetro(s) tx_status inválido(s)", null, __LINE__);
    }                    

    if(!isset($data['endereco']['tx_logradouro'])){
     return Utils::response(true, "Parâmetro: endereco.tx_logradouro inválido(s)", null, __LINE__);   
    } 

    if(!isset($data['endereco']['tx_cep'])){
     return Utils::response(true, "Parâmetro: endereco.tx_cep inválido(s)", null, __LINE__);   
    }

    if(!isset($data['endereco']['tx_cidade'])){
     return Utils::response(true, "Parâmetro: endereco.tx_cidade inválido(s)", null, __LINE__);   
    }   
    
    if(!isset($data['endereco']['tx_uf'])){
     return Utils::response(true, "Parâmetro: endereco.tx_uf", null, __LINE__);   
    }  

    if(!isset($data['nu_cnpj'])){
     return Utils::response(true, "Parâmetro: nu_cnpj inválido(s)", null, __LINE__);   
    }   

    if(isset($data['tx_destaque_ativo'])){
        if($data['tx_destaque_ativo']==true){
            $data['tx_destaque_ativo'] = 'S';
        }else{
            $data['tx_destaque_ativo'] = 'N';
        }
    }

    if(!is_numeric($data['nu_cnpj'])){
     return Utils::response(true, "Campo CNPJ só pode conter números.", null, __LINE__);   
    }   

    if(!Utils::validaCNPJ($data['nu_cnpj'])){
        return Utils::response(true, "CNPJ inválido", null, __LINE__);
    }

    $result = Pessoa::where('tx_email', '=', $data['tx_email'])->get();
    if ($result->count() == 0) {
        $n = new Pessoa();
        $n->tx_email = $data['tx_email'];
        $n->tx_senha = $data['tx_senha'];
        $n->id_nivel = $data['id_nivel'];
    
        if($n->save()){
        
            $f = new Fornecedor();
            $f->id_pessoa       = $n->id_pessoa;
            $f->nu_cnpj         = $data['nu_cnpj'];
            $f->tx_razao_social = $data['tx_razao_social'];
            $f->tx_nm_fantasia  = $data['tx_nm_fantasia'];
            $f->tx_nm_contato   = $data['tx_nm_contato'];
            $f->tx_status       = $data['tx_status'];
            $f->tx_destaque_ativo = $data['tx_destaque_ativo'];            
            $f->tx_destaque_ativo = $data['tx_destaque_ativo'];    

        if ($f->save()) {  

            $e = new Endereco();
            $e->id_pessoa = $n->id_pessoa;
            $e->id_tipo_endereco = 1;
            $e->tx_logradouro = $data['endereco']['tx_logradouro'];
            $e->tx_complemento = $data['endereco']['tx_complemento'];
            $e->tx_bairro = $data['endereco']['tx_bairro'];
            $e->tx_cep = $data['endereco']['tx_cep'];
            $e->tx_cidade = $data['endereco']['tx_cidade'];
            $e->tx_uf = $data['endereco']['tx_uf'];

            if($e->save()){
                $pessoa = $n->toArray();
                $pessoa['fornecedor'] = $f->toArray();
                $pessoa['endereco'] = $e->toArray();
                return Utils::response(false, "Fornecedor adicionado", $pessoa);
            }else{
                return Utils::response(true, "Erro na criação do endereço", null, __LINE__);
            }            
        } else {
            return Utils::response(true, "Erro na criação da fornecedor", null, __LINE__);
        }
      }else{
        return Utils::response(true, "Erro na criação da pessoa", null, __LINE__);
      }
    } else {
        return Utils::response(true, "Email já utilizado", null);
    }
});

// Função para listar todos fornecedores
// Parâmetros: id_fornecedor
// Table: tb_fornecedor
$app->get('/fornecedor/listall', function() use ($app) {
   
    $results = Fornecedor::all();
    $resultado = [];

    foreach ($results as $fornecedor ) {
        # code...
  
         $categ =  $result = Categoria
                    ::join('tb_subcategoria_fornecedor', 'tb_subcategoria_fornecedor.id_categoria', '=', 'tb_categoria.id_categoria')
                    ->select('tb_categoria.id_categoria','tb_categoria.tx_descricao', 'tb_categoria.tx_status')
                    ->where('tb_subcategoria_fornecedor.id_pessoa_fornecedor', $fornecedor->id_pessoa)        
                    ->distinct()
                    ->get();

        $forArray = $fornecedor->toArray();
        $forArray['categorias'] = $categ->toArray();
        $resultado[] = $forArray;
    }

    return Utils::response(false, null, $resultado);
});


// Função para editar um fornecedor
// Parâmetros: id_fornecedor
// Table: tb_fornecedor
$app->put('/fornecedor/update/status', function() use ($app) {
   
     $json = $app->request->getBody();
     $data = json_decode($json, true);


    $results = Fornecedor::where('id_pessoa', '=', $data['id_pessoa'])->first();

    if($results == null || $results->count() == 0) {
        return Utils::response(true, "Erro ao buscar pessoa", null, __LINE__);
    }

    if(isset($data['tx_status'])){
        $results->tx_status = $data['tx_status'];
    } else {
        return Utils::response(true, "Não editou", null, __LINE__); 
    }

    if ($results->push() ){
        return Utils::response(false, "Status alterado", $results);
    }else {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }

});

// Função para editar um fornecedor
// Parâmetros: id_fornecedor
// Table: tb_fornecedor
$app->put('/pessoa/update/status', function() use ($app) {
   
     $json = $app->request->getBody();
     $data = json_decode($json, true);


    $results = Pessoa::where('id_pessoa', '=', $data['id_pessoa'])->first();

    if($results == null || $results->count() == 0) {
        return Utils::response(true, "Erro ao buscar pessoa", null, __LINE__);
    }

    if(isset($data['tx_status'])){
        $results->tx_status = $data['tx_status'];
    } else {
        return Utils::response(true, "Não editou", null, __LINE__); 
    }

    if ($results->push() ){
        return Utils::response(false, "Status alterado", $results);
    }else {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }

});

// Função para editar um fornecedor
// Parâmetros: id_fornecedor
// Table: tb_fornecedor
$app->put('/fornecedor/update', function() use ($app) {
    $result = [];

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    $fornecedor = Fornecedor::where('id_pessoa', '=', $data['id_pessoa'])->first();

    if($fornecedor == null || $fornecedor->count() == 0) {
        return Utils::response(true, "Erro ao buscar pessoa", null, __LINE__);
    }

    $result['fornecedor'] = $fornecedor->toArray();

    if(isset($data['tx_status'])){
        $fornecedor->tx_status = $data['tx_status'];
    }

    if(empty($data['nu_cnpj']) ){
        return Utils::response(true, "CNPJ deve ser preenchido", null, __LINE__);
    }

    if (isset($data['nu_cnpj'])) {
        if(!Utils::validaCNPJ($data['nu_cnpj'])){
            return Utils::response(true, "CNPJ inválido", null, __LINE__);
        }else{
            $fornecedor->nu_cnpj = $data['nu_cnpj'];
        }
    }

    if (isset($data['tx_razao_social'])){
        $fornecedor->tx_razao_social = $data['tx_razao_social'];
    }

    if (isset($data['tx_nm_fantasia'])) {
        $fornecedor->tx_nm_fantasia = $data['tx_nm_fantasia'];
    }

    if (isset($data['tx_nm_contato'])) {
        $fornecedor->tx_nm_contato = $data['tx_nm_contato'];
    }

    if(isset($data['endereco'])){
        $e = Endereco::where("id_pessoa", "=", $data['id_pessoa'])->first();

        if($e == null || $e->count() == 0) {
            $e = new Endereco();
            $e->id_pessoa = $fornecedor->id_pessoa;

        }

        if(isset($data['endereco']['id_tipo_endereco'])){
            $e->id_tipo_endereco = $data['endereco']['id_tipo_endereco'];
        }else{
            $e->id_tipo_endereco = 1;
        }

        if(isset($data['endereco']['tx_logradouro'])){
            $e->tx_logradouro = $data['endereco']['tx_logradouro'];
        }

        if(isset($data['endereco']['tx_complemento'])){
            $e->tx_complemento = $data['endereco']['tx_complemento'];
        }    

        if(isset($data['endereco']['tx_bairro'])){
            $e->tx_bairro = $data['endereco']['tx_bairro'];
        }                

        if(isset($data['endereco']['tx_cep'])){
            $e->tx_cep = $data['endereco']['tx_cep'];
        }   

        if(isset($data['endereco']['tx_cidade'])){
            $e->tx_cidade = $data['endereco']['tx_cidade'];
        }   

        if(isset($data['endereco']['tx_uf'])){
            $e->tx_uf = $data['endereco']['tx_uf'];
        }  
    
        if($fornecedor->push()){

            if($e->push()){
                $result['endereco'] = $e->toArray();
            }else{
                return Utils::response(true, "Erro na criação do endereço", null, __LINE__);
            }  
                 
        }else{
            return Utils::response(true, "Erro ao salvar fornecedor", null, __LINE__);
        }

    }

    if ($fornecedor->push()){        
        return Utils::response(false, "Fornecedor alterado", $result);
    }else {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }

});

// Função para listar um fornecedor por id
// Parâmetros:  
// Table: tb_fornecedor
$app->get('/fornecedor/:id_fornecedor', function($id) use ($app) {
   try {
        $resource = Fornecedor::findOrFail($id);
    }catch(\Exception $e){
        return Utils::response(true, "Fornecedor inexistente.",null); 
    }
    return Utils::response(false, null, $resource);
});

// Função para adicionar condomĩnio
// Parâmetros: pessoa, tx_nome_condominio, tx_identificao, tx_cep, id_tipo_endereco, tx_logradouro, tx_bairro, tx_cidade, tx_uf
// Table: tb_pessoa, tb_endereco, tb_condominio
$app->post('/condominio/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_email'])){
        return Utils::response(true, "Parâmetro(s) tx_email inválido(s)", $data, __LINE__);
    }

    if (!isset($data['tx_senha'])){
        return Utils::response(true, "Parâmetro(s) tx_senha inválido(s)", $data, __LINE__);
    }

    if (!isset($data['tx_cep'])){
        return Utils::response(true, "Parâmetro(s) tx_cep inválido(s)", $data, __LINE__);
    } 

    if (!isset($data['tx_cidade'])){
        return Utils::response(true, "Parâmetro(s) tx_cidade inválido(s)", $data, __LINE__);
    } 

    if (!isset($data['tx_uf'])){
        return Utils::response(true, "Parâmetro(s) tx_uf inválido(s)", $data, __LINE__);
    } 

    if (!isset($data['tx_nome_condominio'])){
        return Utils::response(true, "Parâmetro(s) tx_nome_condominio inválido(s)", $data, __LINE__);
    } 

    if (!isset($data['tx_identificacao'])){
        return Utils::response(true, "Parâmetro(s) tx_identificacao inválido(s)", $data, __LINE__);
    }

    if (!isset($data['id_tipo_endereco']) ){
        $data['id_tipo_endereco'] = 2;
    }

    if (!isset($data['tx_complemento']) ) {
        $data['tx_complemento'] = "";
    }

    if (!isset($data['tx_bairro']) ) {
        $data['tx_bairro'] = "";
    }

    if (!isset($data['tx_logradouro']) ) {
        $data['tx_logradouro'] = "";
    }

    $result = Pessoa::where('tx_email','=',$data['tx_email'] )->get();
        
    if ($result->count() == 0) {
        $n = new Pessoa();
        $n->tx_email = $data['tx_email'];
        $n->tx_senha = $data['tx_senha'];
        $n->tx_foto  = $data['tx_foto'];
        $n->id_nivel = $data['id_nivel'];

        if ($n->save()) {
        
            $e = Endereco::where("tx_cep", "=", $data['tx_cep'])->first();
            if($e == null || $e->count() == 0) {
                $e = new Endereco();
            }

            $e->id_pessoa = $n->id_pessoa;
            $e->id_tipo_endereco = $data['id_tipo_endereco'];
            $e->tx_logradouro = $data['tx_logradouro'];
            $e->tx_complemento = $data['tx_complemento'];
            $e->tx_bairro = $data['tx_bairro'];
            $e->tx_cep = $data['tx_cep'];
            $e->tx_cidade = $data['tx_cidade'];
            $e->tx_uf = $data['tx_uf'];

            if ($e->save()) {
                $c = new Condominio();
                $c->id_pessoa = $n->id_pessoa;
                $c->tx_nome_condominio = $data['tx_nome_condominio'];
                $c->tx_identificacao   = $data['tx_identificacao'];

                if ($c->save()) {
                    $pessoa = $n->toArray();
                    $pessoa['condominio'] = $c->toArray();
                    $pessoa['endereco'] = $e->toArray();
                    unset($pessoa['condominio']['id_pessoa']);

                    return Utils::response(false, "Condominio adicionado", $pessoa['condominio']);
                }else {
                    return Utils::response(true, "Erro na criação do Condominio", null, __LINE__);
                }
            }
            
        } else {
            return Utils::response(true, "Erro na criação da pessoa", null, __LINE__);
        }
    } else {
        return Utils::response(true, "Email já utilizado.", null, __LINE__);
    }    
});

// Função para listar todos condomĩnios
// Parâmetros:  
// Table: tb_condominio
$app->get('/condominio/listall', function() use ($app) {
    $results = Condominio::all();
    return Utils::response(false, null, $results);
});

// Função para listar um condominio por id
// Parâmetros:  
// Table: tb_condominio
$app->get('/condominio/:id_condominio', function($id) use ($app) {
   try {
        $resource = Condominio::findOrFail($id);
    }catch(\Exception $e){
        return Utils::response(true, "Condomínio inexistente.",null); 
    }
    return Utils::response(false, null, $resource);
});

// Função para adicionar subcategoria 
// Parâmetros: tx_descricao, id_categoria, tx_status
// Table: tb_subcategoria
$app->post('/subcategoria/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_descricao']) ||
        !isset($data['id_categoria']) ||
        !isset($data['tx_status'])) {

        return Utils::response(true, "Parâmetro(s) inválido(s)", null, __LINE__);
    }

    $s = new Subcategoria();
    $s->tx_descricao = $data['tx_descricao'];
    $s->tx_status = $data['tx_status'];
    $s->id_categoria = $data['id_categoria'];

    if ($s->save()){
        return Utils::response(false, "Subcategoria adicionada", $s);
    }else {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }
});

// Função para editar uma subcategoria
// Parâmetros: id_subcategoria
// Table: tb_subcategoria
$app->put('/subcategoria/update', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    $results = Subcategoria::where('id_subcategoria', '=', $data['id_subcategoria'])->first();

    if($results == null || $results->count() == 0) {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }

    if(isset($data['tx_descricao'])){
        $results->tx_descricao = $data['tx_descricao'];
    }

    if(isset($data['tx_status'])){
        $results->tx_status = $data['tx_status'];
    }

    if(isset($data['id_categoria'])){
        $results->id_categoria = $data['id_categoria'];
    }

    if ($results->push() ){
        return Utils::response(false, "Subcategoria editada", $results);
    }else {
        return Utils::response(true, "Erro ao criar subcategoria", null, __LINE__);
    }

});

// Função para deletar uma subcategoria
// Parâmetros: id_subcategoria
// Table: tb_subcategoria
$app->delete('/subcategoria/remove', function() use ($app) {
    $json = $app->request->getBody();
    $data = json_decode($json, true);
   
    // TODO: VARRER OS FORNECEDORES E EXCLUIR AS REFERENCIAS ANTES DE FINALMENTE REMOVER A SUBCATEGORIA

    $results = Subcategoria::where('id_subcategoria','=', $data['id_subcategoria'])->first();
    
    if($results == null || $results->count() == 0) {
        return Utils::response(true, "Subcategoria inexistente", null, __LINE__);
    }

    $result = FornecedorSubcategoria::where('id_subcategoria','=',$data['id_subcategoria'])->delete();


    $results = Subcategoria::where('id_subcategoria','=', $data['id_subcategoria'])->delete();

    if( $results == null ){
        return Utils::response(true, "Erro ao excluir subcategoria", null, __LINE__);
    }else {
        return Utils::response(false, "Subcategoria removida", $results);
    }
    
});


// Função para listar todas os fornecedores por subcategoria
// Parâmetros: id_subcategorias
// Table: tb_subcategoria, tb_subcategoria_fornecedor


// Função para listar todas as subcategorias por fornecedor
// Parâmetros: id_fornecedor
// Table: tb_subcategoria, tb_subcategoria_fornecedor
$app->get('/subcategoria/listForProvider/:id_fornecedor', function($id_fornecedor) use ($app) {
    
    $result = Subcategoria
    ::join('tb_subcategoria_fornecedor', 'tb_subcategoria_fornecedor.id_subcategoria', '=', 'tb_subcategoria.id_subcategoria')
    ->select('tb_subcategoria.id_subcategoria','tb_subcategoria.tx_descricao', 'tb_subcategoria.tx_status','tb_subcategoria.id_categoria')
    ->where('tb_subcategoria_fornecedor.id_pessoa_fornecedor', $id_fornecedor)        
    ->getQuery() // Optional: downgrade to non-eloquent builder so we don't build invalid User objects.
    ->get();

    if ($result == null) {
        return Utils::response(true,"Não há subcategorias vinculadas a este fornecedor", null);
    }

    return Utils::response(false, null, $result);
});


// Função para listar todas as subcategorias por categoria
// Parâmetros: id_categoria
// Table: tb_fornecedor, tb_subcategoria_fornecedor
$app->get('/subcategoria/listForCategory/:id_categoria', function($id_categoria) use ($app) {
   
    $result = Subcategoria::where('tb_subcategoria.id_categoria', $id_categoria)->get();

    if ($result == null || $result ->count() < 1) {
        return Utils::response(false,"Não há subcategorias para essa categoria", null);
    }

    return Utils::response(false, null, $result);
});



// Função para adicionar um orçamento
// Parâmetros: id_pessoa_fornecedor, id_pessoa_condominio, tx_descricao_orcamento, tx_status, tx_quando
// Table: tb_orcamento
$app->post('/orcamento/add', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['id_pessoa_fornecedor']) ||
        !isset($data['id_pessoa_condominio']) ||
        !isset($data['tx_descricao_orcamento'])) {

        return Utils::response(true, "Parâmetro(s) inválido(s)", null, __LINE__);
    }

    $n = new Orcamento();

    if (isset($data['tx_datavisita']) ) {
         $n->tx_datavisita = $data['tx_datavisita'];
    }

    $n->id_pessoa_fornecedor   = $data['id_pessoa_fornecedor'];
    $n->id_pessoa_condominio   = $data['id_pessoa_condominio'];
    $n->tx_descricao_orcamento = $data['tx_descricao_orcamento'];
    $n->dt_solicitacao         = date("Y-m-d");
    $n->dt_resposta            = null;
    $n->tx_status              = $data['tx_status'];
    $n->tx_visita              = "";
    $n->tx_quando              = $data['tx_quando'];

    if ($n->save()) {
        return Utils::response(false, "Orcamento adicionado", $n);
    } else {
        return Utils::response(true, "Erro na criação do orcamento", null, __LINE__);
    }
});
// Função para aceitar orçamento
// Parâmetros: id_orçamento, id_pessoa
// Table: tb_orcamento, tb_fornecedor
$app->put('/orcamento/update', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

   try {
        $resource = Orcamento::findOrFail($data['id_orcamento']);
    }catch(\Exception $e){
        return Utils::response(true, "Orçamento inexistente.",null); 
    }

    $fornecedor = Fornecedor::where('id_pessoa','=',$data['id_pessoa'])->first();

    if ($fornecedor == null) {
       return Utils::response(true,"Fornecedor inexistente.",null); 
    }

    if(!isset($data['id_pessoa_fornecedor'])) {
        $data['tx_visita'] = "N";
    }

    $resource->tx_visita = $data['tx_visita'];
    $resource->tx_status = $data['tx_status'];
    $resource->dt_resposta = date("Y-m-d");

    if ($resource -> update() ){
        return Utils::response(false, "Orçamento aceito", $resource);
    }else {
        return Utils::response(true, "Erro ao aceitar orçamento", __LINE__);
    }

});

// Função para listar todos os orçamentos
// Parâmetros: 
// Table: tb_orcamento
$app->get('/orcamento/listall', function() use ($app) {
    $results = Orcamento::all();
    return Utils::response(false, null, $results);
});

// Função para listar todos os orçamentos para um determinado condominio
// Parâmetros: id_pessoa_condominio
// Table: tb_orcamento
$app->get('/orcamento/listForCondominium/:id_pessoa', function($id) use ($app) {
    
    if (!$id) {
        return Utils::response(true, "Parâmetro(s) inválido(s) -> VAZIO", $app->request, __LINE__);
    }

    $results = Orcamento::where('id_pessoa_condominio', '=', $id)->get();

    if ($results == null) {
        return Utils::response(true, "Não hã solicitações de orçamentos." ,null);
    }

    return Utils::response(false, null, $results);
});

// Função para listar todos os orçamentos para um determinado fornecedor
// Parâmetros: id_pessoa_fornecedor
// Table: tb_orcamento
$app->get('/orcamento/listForProvider/:id_pessoa', function($id) use ($app) {
    
    if (!$id) {
        return Utils::response(true, "Parâmetro(s) inválido(s) -> VAZIO", $app->request, __LINE__);
    }

    $results = Orcamento::where('id_pessoa_fornecedor', '=', $id)->get();

    if ($results == null) {
        return Utils::response(true, "Não hã solicitações de orçamentos no momento", null);
    }

    return Utils::response(false, "Solicitacoes", $results);
});

// Função para buscar endereço de uma determinada pessoa
// Parâmetros: id_pessoa
// Table: tb_endereco
$app->get('/endereco/forId/:id_pessoa', function($id) use ($app) {
    
    try {
        $results = Endereco::findOrFail($id);
    }catch(\Exception $e){
        return Utils::response(true, "Endereço não cadastrados.",null); 
    }

    if ($results == null) {
        return Utils::response(true, "Não há endereços cadastrados para este usuário.", null); 
    }

    return Utils::response(false, null, $results);
});


$app->get('/teste/:id_pessoa', function($id) use ($app) {
    
    if (!$id) {
        return Utils::response(true, "Parâmetro(s) inválido(s) -> VAZIO", $app->request, __LINE__);
    }

    $results = Endereco::findOrFail($id);

    if ($results == null) {
        return Utils::response(true, "Não há endereços cadastrados para este usuário.", null); 
    }

    return Utils::response(false, null, $results);
});


// Função para buscar pessoa por email
// Parâmetros: tx_email
// Table: tb_pessoa
$app->post('/pessoa/email', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!isset($data['tx_email'])) {
        return Utils::response(true, "Parâmetro de e-mail inválido", $app->request, __LINE__);
    }
    $results = Pessoa::where('tx_email','=',$data['tx_email'])->first();
    
    if($results==null){
        return Utils::response(true, "Credenciais erradas.",null );
    }

    return Utils::response(false, null, $results->toArray() );

});

// Função para logar no aplicativo
// Parâmetros: tx_email, tx_senha
// Table: tb_pessoa
$app->post('/login', function() use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true);

    if (!$data['tx_email'] || !$data['tx_senha']) {
        return Utils::response(true, "Parâmetro(s) inválido(s) -> VAZIO", $app->request, __LINE__);
    }
    $results = Pessoa::where('tx_email','=',$data['tx_email'])->where('tx_senha','=',$data['tx_senha'])->first();
    
    if($results==null){
        return Utils::response(true, "Credenciais erradas.",null );
    }

    return Utils::response(false, null, $results);

});