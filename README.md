# Pomodoro Timer

Extensão do GNOME Shell com um timer Pomodoro na barra superior.

- Você define o número de sessões, o tempo de estudo e o tempo de descanso.
- O ciclo é automático: estudo → descanso → estudo … → fim. Com N sessões, há N − 1 descansos.
- No fim de cada etapa, toca um som do sistema e aparece uma notificação.
- Na barra: `📚 1/3 · 49:12` durante o estudo e `☕ 1/3 · 09:30` durante o descanso.

## Requisitos

- Linux com **GNOME Shell 50** (por exemplo, Ubuntu 26.04).
- Para conferir a sua versão, rode no terminal:

  ```bash
  gnome-shell --version
  ```

## Como instalar

1. **Baixe o pacote.** Na página [Releases](https://github.com/Pradolp/Pomodoro-Timer/releases/latest), baixe o arquivo `pomodoro-timer@lucasprado.shell-extension.zip`. Ou baixe pelo terminal:

   ```bash
   cd ~/Downloads
   wget https://github.com/Pradolp/Pomodoro-Timer/releases/latest/download/pomodoro-timer@lucasprado.shell-extension.zip
   ```

2. **Instale.** No terminal, dentro da pasta onde o arquivo foi salvo:

   ```bash
   gnome-extensions install pomodoro-timer@lucasprado.shell-extension.zip
   ```

3. **Saia da sessão e entre de novo.** O GNOME só encontra extensões novas quando a sessão começa. Não basta bloquear a tela: é preciso encerrar a sessão.

4. **Ative a extensão:**

   ```bash
   gnome-extensions enable pomodoro-timer@lucasprado
   ```

   Também dá para ativar pelo app **Extensões**, ligando o "Pomodoro Timer".

Um 🍅 aparece na barra superior. Pronto!

## Como usar

### Configurar

Clique no 🍅 na barra superior e depois em **Configurações**. Ajuste:

- **Sessões:** quantos blocos de estudo (ex.: 3).
- **Estudo:** minutos de cada bloco (ex.: 50).
- **Descanso:** minutos de pausa entre os blocos (ex.: 10).

Para começar, clique em **▶ Iniciar**, no canto inferior direito da janela.

### Durante o ciclo

Você não precisa mexer em nada: o timer passa sozinho do estudo para o descanso e de volta para o estudo.

- **Fim do estudo:** toca um alarme e aparece uma notificação. O descanso começa a contar alguns segundos depois.
- **Fim do descanso:** toca um som e o próximo bloco de estudo começa.
- **Fim da última sessão:** toca um som de conclusão e o timer volta ao 🍅. A última sessão não tem descanso depois.

### Controles

Clique no timer na barra superior para abrir o menu:

| Botão | O que faz |
|---|---|
| ▶ | Inicia o ciclo, ou continua depois de uma pausa |
| ⏸ | Pausa a contagem |
| ⏭ | Pula para a próxima etapa |
| ⏹ | Para e volta ao início |

## Atualizar para uma versão nova

Baixe o .zip novo e instale com `--force`:

```bash
gnome-extensions install --force pomodoro-timer@lucasprado.shell-extension.zip
```

Depois saia da sessão e entre de novo.

## Desinstalar

```bash
gnome-extensions uninstall pomodoro-timer@lucasprado
```

## Problemas?

- **"Extension does not exist" ao ativar:** saia da sessão e entre de novo (passo 3).
- **A extensão aparece como incompatível:** a sua versão do GNOME não é a 50.
- **Outros erros:** rode o comando abaixo, reproduza o problema e mande a saída numa [issue](https://github.com/Pradolp/Pomodoro-Timer/issues):

  ```bash
  journalctl -f -o cat /usr/bin/gnome-shell
  ```

## Para desenvolvedores

Instalar a partir do código, com um link para a pasta do projeto (editar os arquivos já altera a versão instalada):

```bash
git clone https://github.com/Pradolp/Pomodoro-Timer.git
cd Pomodoro-Timer
./scripts/install.sh
```

Gerar o pacote .zip (fica em `dist/`):

```bash
./scripts/pack.sh
```
