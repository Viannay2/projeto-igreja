"""
backup.py — copia o banco de dados com a data de hoje no nome.
Roda sempre que quiser ter uma cópia de segurança (recomendado:
antes de aplicar qualquer atualização que eu mandar).

Como rodar (na pasta sistema-igreja-api):
    python backup.py
"""

import shutil
from datetime import date
import os

ORIGEM = "sistema_igreja.db"
PASTA_BACKUPS = "backups"

if not os.path.exists(ORIGEM):
    print(f"Não achei '{ORIGEM}' nessa pasta. Roda esse script dentro de sistema-igreja-api.")
else:
    os.makedirs(PASTA_BACKUPS, exist_ok=True)
    nome_backup = f"{PASTA_BACKUPS}/sistema_igreja_{date.today().isoformat()}.db"
    shutil.copy(ORIGEM, nome_backup)
    print(f"Backup feito: {nome_backup}")