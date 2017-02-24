<?php

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model{
  protected $table = 'tb_categoria';
  protected $primaryKey = 'id_categoria';
  public $timestamps = false;

  public function subcategoria(){
    return $this->belongsTo('Subcategoria');
  }
}

class Subcategoria extends Model{
  protected $table = 'tb_subcategoria';
  protected $primaryKey = 'id_subcategoria';

  public $timestamps = false;

  public function categorias(){
    return $this->hasMany('Categoria');
  }
  
  public function subcategoria_fornecedor(){
    return $this->belongsTo('SubcategoriaFornecedor');
  }
}

class Endereco extends Model {
  protected $table = 'tb_pessoa_endereco';
  protected $primaryKey = 'id_pessoa';

  public $timestamps = false;

  public function pessoa () {
    return $this->belongsTo('Pessoa', 'id_pessoa', 'id_pessoa');
  }
}

class Pessoa extends Model{
  protected $table = 'tb_pessoa';
  protected $primaryKey = 'id_pessoa';

  public $timestamps = false;

  protected $dates = [
        'dt_inc',
        'dt_upd'
   ];

  public function nivel(){
    return $this->belongsTo('Nivel');
  }
  
  public function condominios(){
    return $this->belongsTo('Condominio');
  }
  
  public function fornecedor(){
    return $this->belongsTo('Fornecedor');
  }

  public function endereco(){
    return $this->belongsTo('Endereco');
  }

}

class Fornecedor extends Model{
  protected $table = 'tb_fornecedor';
  protected $primaryKey = 'id_pessoa';

  public $timestamps = false;

  public function pessoa(){
    return $this->hasOne('Pessoa');
  }
  
  public function orcamento(){
    return $this->hasMany('Orcamento');
  }

   public function documento(){
    return $this->hasMany('Documento');
  }

  
  public function categoria(){
      return $this->hasMany('SubcategoriaFornecedor');
  }
}


class Nivel extends Model{
  protected $table = 'tb_nivel';
  protected $primaryKey = 'id_nivel';

  public $timestamps = false;

  public function pessoa(){
    return $this->hasMany('Pessoa', 'id_nivel', 'id_nivel');
  }
}

class NivelPermissao extends Model{
  protected $table = 'tb_nivel_permissao';
  protected $primaryKey = 'id_nivel';

  public $timestamps = false;

  public function nivel(){
    return $this->hasOne('Nivel');
  }
}

class Permissao extends Model{
  protected $table = 'tb_permissao';
  protected $primaryKey = 'id_permissao';

  public $timestamps = false;

  public function nivelPermissao(){
    return $this->hasOne('NivelPermissao');
  }
}

class Orcamento extends Model{
  protected $table = 'tb_orcamento';
  protected $primaryKey = 'id_orcamento';

  public $timestamps = false;

  protected $dates = [
        'dt_inc',
        'dt_upd'
   ];

  public function condominio(){
    return $this->belongsTo('Condominio', 'id_pessoa', 'id_pessoa_condominio');
  }
  public function fornecedor(){
    return $this->belongsTo('Fornecedor', 'id_pessoa', 'id_pessoa_fornecedor');
  }
}
class Documento extends Model{
  protected $table = 'tb_documento';
  protected $primaryKey = 'id';

  public $timestamps = false;

  public function fornecedor(){
    return $this->belongsTo('Fornecedor', 'id_pessoa', 'id_pessoa_fornecedor');
  }
}


class Condominio extends Model{
  protected $table = 'tb_condominio';
  protected $primaryKey = 'id_pessoa';

  public $timestamps = false;


  public function pessoa(){
    return $this->belongsTo('Pessoa', 'id_pessoa', 'id_pessoa');
  }

  public function orcamento(){
    return $this->hasOne('Pessoa');
  }
  
//  public function orcamento(){
//    return $this->hasMany('Orcamento');
//  }
}

Class Contato extends Model {
  protected $table = 'tb_pessoa_contato';
  protected $primaryKey = ['id_pessoa','id_tipo_contato'];

  public $timestamps = false;


  public function pessoa(){
    return $this->belongsTo('Pessoa', 'id_pessoa', 'id_pessoa');
  }

}



class FornecedorSubcategoria extends Model{
  protected $table = 'tb_subcategoria_fornecedor';
  protected $primaryKey = ['id_pessoa_fornecedor', 'id_subcategoria'];

  public $timestamps = false;
  
  protected $dates = [
        'dt_inc',
        'dt_upd'
   ];

  public function pessoa(){
    return $this->belongsTo('Pessoa', 'id_pessoa', 'id_pessoa');
  }
  
}