import getpass
import bcrypt

from database import SessionLocal
from models_db import UsuarioDB


EMAIL_SUPER_ADMIN = "armindoviannay2@gmail.com"


def criar_super_admin():
    db = SessionLocal()

    try:
        existente = (
            db.query(UsuarioDB)
            .filter(UsuarioDB.email == EMAIL_SUPER_ADMIN)
            .first()
        )

        if existente:
            print("\n⚠️ Já existe um usuário com esse e-mail.")
            print(f"Nome: {existente.nome_completo}")
            print(f"Cargo atual: {existente.cargo}")

            if existente.cargo != "super_admin":
                confirmar = input(
                    "\nEsse usuário não é Super Admin. "
                    "Deseja transformá-lo em Super Admin? (s/n): "
                ).strip().lower()

                if confirmar == "s":
                    existente.cargo = "super_admin"
                    db.commit()
                    print("\n✅ Usuário atualizado para SUPER ADMINISTRADOR.")
                else:
                    print("\nOperação cancelada.")

            else:
                print("✅ Esse usuário já é SUPER ADMINISTRADOR.")

            return

        print("\n======================================")
        print(" 👑 CRIAR SUPER ADMINISTRADOR")
        print("======================================\n")

        nome = input("Nome: ").strip()

        while not nome:
            print("⚠️ O nome não pode ficar vazio.")
            nome = input("Nome: ").strip()

        print(f"\nE-mail: {EMAIL_SUPER_ADMIN}")

        senha = getpass.getpass("Senha: ")
        confirmacao = getpass.getpass("Confirme a senha: ")

        if not senha:
            print("\n❌ A senha não pode ficar vazia.")
            return

        if senha != confirmacao:
            print("\n❌ As senhas não conferem.")
            return

        senha_hash = bcrypt.hashpw(
            senha.encode("utf-8"),
            bcrypt.gensalt()
        )

        novo_usuario = UsuarioDB(
            nome_completo=nome,
            email=EMAIL_SUPER_ADMIN,
            senha_hash=senha_hash,
            cargo="super_admin",
        )

        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)

        print("\n======================================")
        print("✅ SUPER ADMINISTRADOR CRIADO!")
        print("======================================")
        print(f"Nome: {novo_usuario.nome_completo}")
        print(f"E-mail: {novo_usuario.email}")
        print(f"Cargo: {novo_usuario.cargo}")
        print("\n🔐 A senha foi armazenada usando bcrypt.")
        print("======================================\n")

    except Exception as erro:
        db.rollback()
        print("\n❌ Erro ao criar o Super Administrador:")
        print(erro)

    finally:
        db.close()


if __name__ == "__main__":
    criar_super_admin()