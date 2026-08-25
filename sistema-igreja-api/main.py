from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
import bcrypt
import json
from datetime import date, datetime, timedelta

from jose import jwt

from database import engine, get_db, Base
from models_db import (
    MembroDB,
    VisitanteDB,
    UsuarioDB,
    PresencaDB,
    LiderancaDB,
    AnotacaoDB
)


app = FastAPI(title="API - Sistema de Gestão da Igreja")


# ==========================================================
# CONFIGURAÇÃO DO TOKEN JWT
# ==========================================================

SECRET_KEY = "TROCAR_POR_UMA_CHAVE_SECRETA_MUITO_FORTE"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# CRIA AS TABELAS
# ==========================================================

Base.metadata.create_all(bind=engine)


# ==========================================================
# MODELOS PYDANTIC
# ==========================================================

class Membro(BaseModel):
    id: Optional[int] = None
    nome_completo: str
    data_nascimento: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    estado_civil: Optional[str] = None
    nome_conjuge: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    sexo: Optional[str] = None
    tem_filhos: Optional[str] = None
    filhos: list[dict] = []
    endereco_rua: Optional[str] = None
    endereco_numero: Optional[str] = None
    endereco_complemento: Optional[str] = None
    endereco_bairro: Optional[str] = None
    endereco_cidade: Optional[str] = None
    endereco_cep: Optional[str] = None
    data_batismo: Optional[str] = None
    familia: Optional[str] = None
    status: str = "ativo"
    dons_talentos: Optional[str] = None
    ministerios: list[str] = []
    autoriza_imagem: Optional[str] = None
    responsavel_nome: Optional[str] = None
    responsavel_cpf: Optional[str] = None
    responsavel_parentesco: Optional[str] = None
    responsavel_telefone: Optional[str] = None
    data_cadastro: Optional[str] = None
    data_recepcao_membro: Optional[str] = None
    observacoes: Optional[str] = None


class Visitante(BaseModel):
    id: Optional[int] = None
    nome: str
    data_visita: Optional[str] = None
    convidado_por: Optional[str] = None
    status: str = "primeira_vez"
    telefone: Optional[str] = None
    observacoes: Optional[str] = None


class UsuarioCadastro(BaseModel):
    nome_completo: str
    email: str
    senha: str
    cargo: str = "membro"


class UsuarioSaida(BaseModel):
    id: int
    nome_completo: str
    email: str
    cargo: str


class LoginEntrada(BaseModel):
    email: str
    senha: str


class LoginSaida(BaseModel):
    id: int
    nome_completo: str
    email: str
    cargo: str
    access_token: str
    token_type: str = "bearer"


class RegistroPresenca(BaseModel):
    id: Optional[int] = None
    membro_id: int
    membro_nome: str
    ministerio: str
    data: str
    presente: bool
    falta_justificada: bool = False
    motivo_falta: Optional[str] = None


class ChamadaEntrada(BaseModel):
    data: str
    ministerio: str
    registros: list[dict]


class LiderancaEntrada(BaseModel):
    usuario_id: int
    ministerio_nome: str
    papel: str = "lider"


class Lideranca(BaseModel):
    id: Optional[int] = None
    usuario_id: int
    usuario_nome: str
    ministerio_nome: str
    papel: str


class Anotacao(BaseModel):
    id: Optional[int] = None
    data: str
    ministerio: Optional[str] = None
    texto: str
    autor_nome: Optional[str] = None


# ==========================================================
# FUNÇÃO PARA CRIAR TOKEN
# ==========================================================

def criar_token(usuario: UsuarioDB):

    agora = datetime.utcnow()

    expiracao = agora + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    dados = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "cargo": usuario.cargo,
        "exp": expiracao
    }

    token = jwt.encode(
        dados,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ==========================================================
# FUNÇÃO PARA VERIFICAR TOKEN
# ==========================================================

def verificar_token(token: str):

    try:

        dados = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return dados

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado"
        )


# ==========================================================
# CONVERSORES
# ==========================================================

def membro_para_saida(m: MembroDB) -> Membro:

    return Membro(
        id=m.id,
        nome_completo=m.nome_completo,
        data_nascimento=m.data_nascimento,
        cpf=m.cpf,
        rg=m.rg,
        estado_civil=m.estado_civil,
        nome_conjuge=m.nome_conjuge,
        telefone=m.telefone,
        email=m.email,
        sexo=m.sexo,
        tem_filhos=m.tem_filhos,
        filhos=json.loads(m.filhos_json or "[]"),
        endereco_rua=m.endereco_rua,
        endereco_numero=m.endereco_numero,
        endereco_complemento=m.endereco_complemento,
        endereco_bairro=m.endereco_bairro,
        endereco_cidade=m.endereco_cidade,
        endereco_cep=m.endereco_cep,
        data_batismo=m.data_batismo,
        familia=m.familia,
        status=m.status,
        dons_talentos=m.dons_talentos,
        ministerios=json.loads(m.ministerios_json or "[]"),
        autoriza_imagem=m.autoriza_imagem,
        responsavel_nome=m.responsavel_nome,
        responsavel_cpf=m.responsavel_cpf,
        responsavel_parentesco=m.responsavel_parentesco,
        responsavel_telefone=m.responsavel_telefone,
        data_cadastro=m.data_cadastro,
        data_recepcao_membro=m.data_recepcao_membro,
        observacoes=m.observacoes,
    )


def visitante_para_saida(v: VisitanteDB) -> Visitante:

    return Visitante(
        id=v.id,
        nome=v.nome,
        data_visita=v.data_visita,
        convidado_por=v.convidado_por,
        status=v.status,
        telefone=v.telefone,
        observacoes=v.observacoes,
    )


def presenca_para_saida(p: PresencaDB) -> RegistroPresenca:

    return RegistroPresenca(
        id=p.id,
        membro_id=p.membro_id,
        membro_nome=p.membro_nome,
        ministerio=p.ministerio,
        data=p.data,
        presente=p.presente,
        falta_justificada=p.falta_justificada,
        motivo_falta=p.motivo_falta,
    )


# ==========================================================
# DADOS INICIAIS
# ==========================================================

def popular_dados_iniciais():

    db = next(get_db())

    if db.query(MembroDB).count() == 0:

        db.add_all([
            MembroDB(
                nome_completo="João Silva",
                familia="Silva",
                status="ativo",
                telefone="(21)99999-9999"
            ),

            MembroDB(
                nome_completo="Maria Sousa",
                familia="Souza",
                status="congregando",
                telefone="(21)98888-8888"
            ),

            MembroDB(
                nome_completo="Carlos Oliveira",
                familia="Oliveira",
                status="afastado",
                telefone="(21)97777-7777"
            ),
        ])


    if db.query(VisitanteDB).count() == 0:

        db.add_all([
            VisitanteDB(
                nome="Renata Farias",
                data_visita="2026-08-03",
                convidado_por="Maria Sousa",
                status="ativo"
            ),

            VisitanteDB(
                nome="Diego Martins",
                data_visita="2026-07-27",
                convidado_por="João Silva",
                status="congregando"
            ),

            VisitanteDB(
                nome="Beatriz Nogueira",
                data_visita="2026-07-20",
                convidado_por="Carlos Oliveira",
                status="afastado"
            ),
        ])


    db.commit()
    db.close()


popular_dados_iniciais()


# ==========================================================
# RAIZ
# ==========================================================

@app.get("/")
def raiz():

    return {
        "mensagem": "API do Sistema de Gestão da Igreja está no ar"
    }


# ==========================================================
# MEMBROS
# ==========================================================

@app.get("/api/membros", response_model=list[Membro])
def listar_membros(db: Session = Depends(get_db)):

    membros = db.query(MembroDB).all()

    return [
        membro_para_saida(m)
        for m in membros
    ]


@app.post("/api/membros", response_model=Membro)
def criar_membro(
    membro: Membro,
    db: Session = Depends(get_db)
):

    novo = MembroDB(
        nome_completo=membro.nome_completo,
        data_nascimento=membro.data_nascimento,
        cpf=membro.cpf,
        rg=membro.rg,
        estado_civil=membro.estado_civil,
        nome_conjuge=membro.nome_conjuge,
        telefone=membro.telefone,
        email=membro.email,
        sexo=membro.sexo,
        tem_filhos=membro.tem_filhos,
        filhos_json=json.dumps(membro.filhos),
        endereco_rua=membro.endereco_rua,
        endereco_numero=membro.endereco_numero,
        endereco_complemento=membro.endereco_complemento,
        endereco_bairro=membro.endereco_bairro,
        endereco_cidade=membro.endereco_cidade,
        endereco_cep=membro.endereco_cep,
        data_batismo=membro.data_batismo,
        familia=membro.familia,
        status=membro.status,
        dons_talentos=membro.dons_talentos,
        ministerios_json=json.dumps(membro.ministerios),
        autoriza_imagem=membro.autoriza_imagem,
        responsavel_nome=membro.responsavel_nome,
        responsavel_cpf=membro.responsavel_cpf,
        responsavel_parentesco=membro.responsavel_parentesco,
        responsavel_telefone=membro.responsavel_telefone,
        data_cadastro=date.today().isoformat(),
        data_recepcao_membro=membro.data_recepcao_membro,
        observacoes=membro.observacoes,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return membro_para_saida(novo)


@app.delete("/api/membros/{membro_id}")
def excluir_membro(
    membro_id: int,
    db: Session = Depends(get_db)
):

    membro = db.query(MembroDB).filter(
        MembroDB.id == membro_id
    ).first()

    if membro is None:

        raise HTTPException(
            status_code=404,
            detail="Membro não encontrado"
        )

    db.delete(membro)
    db.commit()

    return {
        "mensagem": "Membro excluído com sucesso"
    }


@app.get(
    "/api/membros/{membro_id}",
    response_model=Membro
)
def buscar_membro(
    membro_id: int,
    db: Session = Depends(get_db)
):

    membro = db.query(MembroDB).filter(
        MembroDB.id == membro_id
    ).first()

    if membro is None:

        raise HTTPException(
            status_code=404,
            detail="Membro não encontrado"
        )

    return membro_para_saida(membro)


@app.put(
    "/api/membros/{membro_id}",
    response_model=Membro
)
def editar_membro(
    membro_id: int,
    dados: Membro,
    db: Session = Depends(get_db)
):

    membro = db.query(MembroDB).filter(
        MembroDB.id == membro_id
    ).first()

    if membro is None:

        raise HTTPException(
            status_code=404,
            detail="Membro não encontrado"
        )

    membro.nome_completo = dados.nome_completo
    membro.data_nascimento = dados.data_nascimento
    membro.cpf = dados.cpf
    membro.rg = dados.rg
    membro.estado_civil = dados.estado_civil
    membro.nome_conjuge = dados.nome_conjuge
    membro.telefone = dados.telefone
    membro.email = dados.email
    membro.sexo = dados.sexo
    membro.tem_filhos = dados.tem_filhos
    membro.filhos_json = json.dumps(dados.filhos)

    membro.endereco_rua = dados.endereco_rua
    membro.endereco_numero = dados.endereco_numero
    membro.endereco_complemento = dados.endereco_complemento
    membro.endereco_bairro = dados.endereco_bairro
    membro.endereco_cidade = dados.endereco_cidade
    membro.endereco_cep = dados.endereco_cep

    membro.data_batismo = dados.data_batismo
    membro.familia = dados.familia
    membro.status = dados.status
    membro.dons_talentos = dados.dons_talentos
    membro.ministerios_json = json.dumps(dados.ministerios)
    membro.autoriza_imagem = dados.autoriza_imagem

    membro.responsavel_nome = dados.responsavel_nome
    membro.responsavel_cpf = dados.responsavel_cpf
    membro.responsavel_parentesco = dados.responsavel_parentesco
    membro.responsavel_telefone = dados.responsavel_telefone

    membro.data_recepcao_membro = dados.data_recepcao_membro
    membro.observacoes = dados.observacoes

    db.commit()
    db.refresh(membro)

    return membro_para_saida(membro)


# ==========================================================
# VISITANTES
# ==========================================================

@app.get(
    "/api/visitantes",
    response_model=list[Visitante]
)
def listar_visitantes(
    db: Session = Depends(get_db)
):

    return [
        visitante_para_saida(v)
        for v in db.query(VisitanteDB).all()
    ]


@app.post(
    "/api/visitantes",
    response_model=Visitante
)
def criar_visitante(
    visitante: Visitante,
    db: Session = Depends(get_db)
):

    novo = VisitanteDB(
        nome=visitante.nome,
        data_visita=visitante.data_visita,
        convidado_por=visitante.convidado_por,
        status=visitante.status,
        telefone=visitante.telefone,
        observacoes=visitante.observacoes,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return visitante_para_saida(novo)


@app.delete("/api/visitantes/{visitante_id}")
def excluir_visitante(
    visitante_id: int,
    db: Session = Depends(get_db)
):

    visitante = db.query(VisitanteDB).filter(
        VisitanteDB.id == visitante_id
    ).first()

    if visitante is None:

        raise HTTPException(
            status_code=404,
            detail="Visitante não encontrado"
        )

    db.delete(visitante)
    db.commit()

    return {
        "mensagem": "Visitante excluído com sucesso"
    }


@app.get(
    "/api/visitantes/{visitante_id}",
    response_model=Visitante
)
def buscar_visitante(
    visitante_id: int,
    db: Session = Depends(get_db)
):

    visitante = db.query(VisitanteDB).filter(
        VisitanteDB.id == visitante_id
    ).first()

    if visitante is None:

        raise HTTPException(
            status_code=404,
            detail="Visitante não encontrado"
        )

    return visitante_para_saida(visitante)


@app.put(
    "/api/visitantes/{visitante_id}",
    response_model=Visitante
)
def editar_visitante(
    visitante_id: int,
    dados: Visitante,
    db: Session = Depends(get_db)
):

    visitante = db.query(VisitanteDB).filter(
        VisitanteDB.id == visitante_id
    ).first()

    if visitante is None:

        raise HTTPException(
            status_code=404,
            detail="Visitante não encontrado"
        )

    visitante.nome = dados.nome
    visitante.data_visita = dados.data_visita
    visitante.convidado_por = dados.convidado_por
    visitante.status = dados.status
    visitante.telefone = dados.telefone
    visitante.observacoes = dados.observacoes

    db.commit()
    db.refresh(visitante)

    return visitante_para_saida(visitante)


# ==========================================================
# USUÁRIOS
# ==========================================================

@app.post(
    "/api/usuarios",
    response_model=UsuarioSaida
)
def criar_usuario(
    usuario: UsuarioCadastro,
    db: Session = Depends(get_db)
):

    existe = db.query(UsuarioDB).filter(
        UsuarioDB.email == usuario.email
    ).first()

    if existe:

        raise HTTPException(
            status_code=400,
            detail="Esse e-mail já está cadastrado"
        )

    senha_hash = bcrypt.hashpw(
        usuario.senha.encode("utf-8"),
        bcrypt.gensalt()
    )

    novo = UsuarioDB(
        nome_completo=usuario.nome_completo,
        email=usuario.email,
        senha_hash=senha_hash,
        cargo=usuario.cargo,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return UsuarioSaida(
        id=novo.id,
        nome_completo=novo.nome_completo,
        email=novo.email,
        cargo=novo.cargo
    )


# ==========================================================
# LOGIN COM JWT
# ==========================================================

@app.post(
    "/api/login",
    response_model=LoginSaida
)
def fazer_login(
    dados: LoginEntrada,
    db: Session = Depends(get_db)
):

    usuario = db.query(UsuarioDB).filter(
        UsuarioDB.email == dados.email
    ).first()

    senha_confere = (
        usuario
        and bcrypt.checkpw(
            dados.senha.encode("utf-8"),
            usuario.senha_hash
        )
    )

    if not senha_confere:

        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos"
        )

    token = criar_token(usuario)

    return LoginSaida(
        id=usuario.id,
        nome_completo=usuario.nome_completo,
        email=usuario.email,
        cargo=usuario.cargo,
        access_token=token,
        token_type="bearer"
    )


# ==========================================================
# TESTE DO TOKEN
# ==========================================================

@app.get("/api/teste-token")
def teste_token(
    authorization: Optional[str] = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Token não informado"
        )

    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Formato do token inválido"
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Token não informado"
        )

    dados = verificar_token(token)

    return {
        "mensagem": "Token válido",
        "dados": dados
    }


# ==========================================================
# PRESENÇAS / CHAMADA
# ==========================================================

@app.post(
    "/api/chamada",
    response_model=list[RegistroPresenca]
)
def salvar_chamada(
    chamada: ChamadaEntrada,
    db: Session = Depends(get_db)
):

    db.query(PresencaDB).filter(
        PresencaDB.ministerio == chamada.ministerio,
        PresencaDB.data == chamada.data,
    ).delete()

    novos = []

    for item in chamada.registros:

        registro = PresencaDB(
            membro_id=item["membro_id"],
            membro_nome=item["membro_nome"],
            ministerio=chamada.ministerio,
            data=chamada.data,
            presente=item["presente"],
            falta_justificada=item.get(
                "falta_justificada",
                False
            ),
            motivo_falta=item.get(
                "motivo_falta"
            ),
        )

        db.add(registro)
        novos.append(registro)

    db.commit()

    for r in novos:

        db.refresh(r)

    return [
        presenca_para_saida(r)
        for r in novos
    ]


@app.get(
    "/api/presencas",
    response_model=list[RegistroPresenca]
)
def listar_presencas(
    db: Session = Depends(get_db)
):

    return [
        presenca_para_saida(p)
        for p in db.query(PresencaDB).all()
    ]


# ==========================================================
# LISTA DE USUÁRIOS
# ==========================================================

@app.get(
    "/api/usuarios",
    response_model=list[UsuarioSaida]
)
def listar_usuarios(
    db: Session = Depends(get_db)
):

    usuarios = db.query(UsuarioDB).all()

    return [
        UsuarioSaida(
            id=u.id,
            nome_completo=u.nome_completo,
            email=u.email,
            cargo=u.cargo
        )
        for u in usuarios
    ]


# ==========================================================
# LIDERANÇAS
# ==========================================================

@app.get(
    "/api/liderancas",
    response_model=list[Lideranca]
)
def listar_liderancas(
    db: Session = Depends(get_db)
):

    liderancas = db.query(LiderancaDB).all()

    return [
        Lideranca(
            id=l.id,
            usuario_id=l.usuario_id,
            usuario_nome=l.usuario_nome,
            ministerio_nome=l.ministerio_nome,
            papel=l.papel
        )
        for l in liderancas
    ]


@app.post(
    "/api/liderancas",
    response_model=Lideranca
)
def atribuir_lideranca(
    entrada: LiderancaEntrada,
    db: Session = Depends(get_db)
):

    usuario = db.query(UsuarioDB).filter(
        UsuarioDB.id == entrada.usuario_id
    ).first()

    if usuario is None:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    ja_existe = db.query(LiderancaDB).filter(
        LiderancaDB.usuario_id == entrada.usuario_id,
        LiderancaDB.ministerio_nome == entrada.ministerio_nome,
    ).first()

    if ja_existe:

        raise HTTPException(
            status_code=400,
            detail=(
                "Essa pessoa já tem papel de liderança "
                "nesse ministério"
            )
        )

    nova = LiderancaDB(
        usuario_id=entrada.usuario_id,
        usuario_nome=usuario.nome_completo,
        ministerio_nome=entrada.ministerio_nome,
        papel=entrada.papel,
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)

    return Lideranca(
        id=nova.id,
        usuario_id=nova.usuario_id,
        usuario_nome=nova.usuario_nome,
        ministerio_nome=nova.ministerio_nome,
        papel=nova.papel
    )


@app.delete(
    "/api/liderancas/{lideranca_id}"
)
def remover_lideranca(
    lideranca_id: int,
    db: Session = Depends(get_db)
):

    lideranca = db.query(LiderancaDB).filter(
        LiderancaDB.id == lideranca_id
    ).first()

    if lideranca is None:

        raise HTTPException(
            status_code=404,
            detail="Liderança não encontrada"
        )

    db.delete(lideranca)
    db.commit()

    return {
        "mensagem": "Liderança removida com sucesso"
    }



# ==========================================================
# ANOTAÇÕES
# ==========================================================

@app.get(
    "/api/anotacoes",
    response_model=list[Anotacao]
)
def listar_anotacoes(
    db: Session = Depends(get_db)
):

    anotacoes = db.query(AnotacaoDB).all()

    return [
        Anotacao(
            id=a.id,
            data=a.data,
            ministerio=a.ministerio,
            texto=a.texto,
            autor_nome=a.autor_nome
        )
        for a in anotacoes
    ]


@app.post(
    "/api/anotacoes",
    response_model=Anotacao
)
def criar_anotacao(
    anotacao: Anotacao,
    db: Session = Depends(get_db)
):

    nova = AnotacaoDB(
        data=anotacao.data,
        ministerio=anotacao.ministerio,
        texto=anotacao.texto,
        autor_nome=anotacao.autor_nome,
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)

    return Anotacao(
        id=nova.id,
        data=nova.data,
        ministerio=nova.ministerio,
        texto=nova.texto,
        autor_nome=nova.autor_nome
    )


@app.delete(
    "/api/anotacoes/{anotacao_id}"
)
def excluir_anotacao(
    anotacao_id: int,
    db: Session = Depends(get_db)
):

    anotacao = db.query(AnotacaoDB).filter(
        AnotacaoDB.id == anotacao_id
    ).first()

    if anotacao is None:

        raise HTTPException(
            status_code=404,
            detail="Anotação não encontrada"
        )

    db.delete(anotacao)
    db.commit()

    return {
        "mensagem": "Anotação excluída com sucesso"
    }