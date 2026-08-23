from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base


class MembroDB(Base):
    __tablename__ = "membros"

    id = Column(Integer, primary_key=True, index=True)

    # ----- Dados pessoais -----
    nome_completo = Column(String, nullable=False)
    data_nascimento = Column(String, nullable=True)
    cpf = Column(String, nullable=True)
    rg = Column(String, nullable=True)
    estado_civil = Column(String, nullable=True)  # solteiro, casado, divorciado, viuvo, outro
    nome_conjuge = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    sexo = Column(String, nullable=True)
    tem_filhos = Column(String, nullable=True)
    # Lista de filhos guardada como texto JSON, ex: '[{"nome":"Ana","idade":"8"}]'
    filhos_json = Column(Text, default="[]")

    # ----- Endereço -----
    endereco_rua = Column(String, nullable=True)
    endereco_numero = Column(String, nullable=True)
    endereco_complemento = Column(String, nullable=True)
    endereco_bairro = Column(String, nullable=True)
    endereco_cidade = Column(String, nullable=True)
    endereco_cep = Column(String, nullable=True)

    # ----- Vida cristã -----
    data_batismo = Column(String, nullable=True)
    familia = Column(String, nullable=True)
    status = Column(String, default="ativo")
    dons_talentos = Column(Text, nullable=True)
    ministerios_json = Column(Text, default="[]")  # lista em JSON, ex: '["Louvor", "Jovens"]'

    # ----- Autorização de imagem -----
    autoriza_imagem = Column(String, nullable=True)  # "sim" ou "nao"

    # ----- Responsável (se for menor de idade) -----
    responsavel_nome = Column(String, nullable=True)
    responsavel_cpf = Column(String, nullable=True)
    responsavel_parentesco = Column(String, nullable=True)
    responsavel_telefone = Column(String, nullable=True)

    # ----- Uso interno da igreja -----
    data_cadastro = Column(String, nullable=True)  # preenchido sozinho na hora de criar
    data_recepcao_membro = Column(String, nullable=True)
    observacoes = Column(Text, nullable=True)


class VisitanteDB(Base):
    __tablename__ = "visitantes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    data_visita = Column(String, nullable=True)
    convidado_por = Column(String, nullable=True)
    status = Column(String, default="ativo")
    telefone = Column(String, nullable=True)
    observacoes = Column(Text, nullable=True)


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)
    cargo = Column(String, default="membro")


class PresencaDB(Base):
    __tablename__ = "presencas"

    id = Column(Integer, primary_key=True, index=True)
    membro_id = Column(Integer, nullable=False)
    membro_nome = Column(String, nullable=False)
    ministerio = Column(String, nullable=False)
    data = Column(String, nullable=False)
    presente = Column(Boolean, default=False)
    falta_justificada = Column(Boolean, default=False)
    motivo_falta = Column(Text, nullable=True)


class EventoDB(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    data = Column(String, nullable=False)
    tipo = Column(String, default="lembrete")  # "importante" ou "lembrete"
    icone = Column(String, default="fa-calendar-days")


class MinisterioDB(Base):
    __tablename__ = "ministerios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    lider = Column(String, nullable=True)
    icone = Column(String, default="fa-cross")


class LiderancaDB(Base):
    __tablename__ = "liderancas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, nullable=False)
    usuario_nome = Column(String, nullable=False)
    ministerio_nome = Column(String, nullable=False)  # liga pelo NOME do ministério, igual membro.ministerios
    papel = Column(String, default="lider")  # "lider", "vice" ou "auxiliar"


class AnotacaoDB(Base):
    __tablename__ = "anotacoes"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(String, nullable=False)
    ministerio = Column(String, nullable=True)  # null/vazio = anotação geral, não de um grupo específico
    texto = Column(Text, nullable=False)
    autor_nome = Column(String, nullable=True)