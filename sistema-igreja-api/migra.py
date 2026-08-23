"""
migra.py — roda isso UMA VEZ pra atualizar um banco antigo com as
colunas novas que foram adicionadas depois que ele foi criado.
Não apaga nenhum dado — só adiciona o que está faltando.

Como rodar (na pasta sistema-igreja-api, com o servidor PARADO):
    python migra.py
"""

import sqlite3

conexao = sqlite3.connect("sistema_igreja.db")
cursor = conexao.cursor()


def colunas_existentes(tabela):
    cursor.execute(f"PRAGMA table_info({tabela})")
    return {linha[1] for linha in cursor.fetchall()}


def garantir_coluna(tabela, coluna, tipo_sql):
    existentes = colunas_existentes(tabela)
    if coluna not in existentes:
        print(f"Adicionando coluna '{coluna}' em '{tabela}'...")
        cursor.execute(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo_sql}")
    else:
        print(f"'{coluna}' já existe em '{tabela}', pulando.")


# ----- Colunas de rodadas anteriores (membros) -----
garantir_coluna("membros", "ministerios_json", "TEXT DEFAULT '[]'")
garantir_coluna("membros", "sexo", "TEXT")
garantir_coluna("membros", "tem_filhos", "TEXT")
garantir_coluna("membros", "data_cadastro", "TEXT")
garantir_coluna("membros", "cpf", "TEXT")
garantir_coluna("membros", "rg", "TEXT")
garantir_coluna("membros", "estado_civil", "TEXT")
garantir_coluna("membros", "endereco_rua", "TEXT")
garantir_coluna("membros", "endereco_numero", "TEXT")
garantir_coluna("membros", "endereco_complemento", "TEXT")
garantir_coluna("membros", "endereco_bairro", "TEXT")
garantir_coluna("membros", "endereco_cidade", "TEXT")
garantir_coluna("membros", "endereco_cep", "TEXT")
garantir_coluna("membros", "dons_talentos", "TEXT")
garantir_coluna("membros", "autoriza_imagem", "TEXT")
garantir_coluna("membros", "responsavel_nome", "TEXT")
garantir_coluna("membros", "responsavel_cpf", "TEXT")
garantir_coluna("membros", "responsavel_parentesco", "TEXT")
garantir_coluna("membros", "responsavel_telefone", "TEXT")
garantir_coluna("membros", "data_recepcao_membro", "TEXT")
garantir_coluna("membros", "observacoes", "TEXT")
garantir_coluna("membros", "nome_conjuge", "TEXT")
garantir_coluna("membros", "filhos_json", "TEXT DEFAULT '[]'")

# ----- Colunas de presenças -----
garantir_coluna("presencas", "falta_justificada", "BOOLEAN DEFAULT 0")
garantir_coluna("presencas", "motivo_falta", "TEXT")

# ----- Colunas novas de hoje (visitantes) -----
garantir_coluna("visitantes", "telefone", "TEXT")
garantir_coluna("visitantes", "observacoes", "TEXT")

# ----- Migração de VALORES: status de 3 opções pra 2 (se ainda não rodou) -----
cursor.execute("UPDATE membros SET status = 'ativo' WHERE status = 'congregando'")
qtd_congregando = cursor.rowcount
cursor.execute("UPDATE membros SET status = 'desligado' WHERE status = 'afastado'")
qtd_afastado = cursor.rowcount

if qtd_congregando or qtd_afastado:
    print(f"\nStatus atualizado: {qtd_congregando} membro(s) 'Congregando' -> 'Ativo', "
          f"{qtd_afastado} membro(s) 'Afastado' -> 'Desligado'.")

conexao.commit()
conexao.close()

print("\nPronto! Banco atualizado sem perder nenhum dado.")