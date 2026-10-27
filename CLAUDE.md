# Timer Pomodoro — widget para a área de trabalho

Referência do projeto, a partir da conversa inicial (27/10/2026). Idioma: português.

## Objetivo

Criar um timer Pomodoro que funcione como widget na área de trabalho e que possa ser compartilhado com outras pessoas.

## Ambiente

- Ubuntu 26.04 LTS, GNOME Shell, sessão **Wayland**
- Disponíveis: `gjs`, `gnome-shell`, `python3`

## Abordagem escolhida

**Extensão do GNOME Shell (JavaScript/GJS).**
- É a forma nativa de fazer um widget no GNOME, com o timer na barra superior.
- Compartilhamento pelo site extensions.gnome.org, com instalação em um clique.
- Limitação: funciona só no GNOME.
- Alternativa descartada: um app em Python com GTK4. Funcionaria em qualquer Linux, mas no Wayland uma janela não pode se fixar na área de trabalho nem ficar sempre por cima sozinha.

## Como o timer funciona

**Configuração (definida pelo usuário):**
- Número de sessões (ex.: 3)
- Tempo de estudo (ex.: 50 min)
- Tempo de descanso (ex.: 10 min)
- Som X, tocado no fim do estudo
- Som Y, tocado no fim do descanso

**Ciclo automático:**
1. Começa o bloco de estudo.
2. Ao fim do estudo, toca o som X e o descanso começa sozinho.
3. Ao fim do descanso, toca o som Y e o próximo bloco de estudo começa sozinho.
4. Repete até completar o número de sessões.
5. A última sessão de estudo **não tem descanso depois**. Com N sessões, há sempre **N − 1 descansos**.
   - Exemplo com 3 sessões: estudo → descanso → estudo → descanso → estudo → fim.
6. Ao terminar a última sessão, o programa **zera** e volta ao estado inicial. Aí o usuário decide se para ou se configura mais sessões.

O usuário não precisa mexer em nada durante o ciclo, mas pode parar quando quiser.

**Interface proposta:**
- Na barra superior: `📚 1/3 · 49:12` durante o estudo e `☕ 1/3 · 09:30` durante o descanso.
- Notificação na tela junto com o som.
- Ao clicar no timer, abre um menu com botões de símbolo: **⏸ Pausar / ▶ Continuar**, **⏭ Pular etapa** e **⏹ Parar**.
  - Usar os ícones simbólicos do próprio GNOME (`media-playback-pause-symbolic`, `media-playback-start-symbolic`, `media-skip-forward-symbolic`, `media-playback-stop-symbolic`).
- **Pausar e continuar:** a pausa congela a contagem e o "continuar" segue de onde parou.
- **Iniciar pelas configurações:** botão ▶ Iniciar no canto inferior direito, abaixo de "Descanso". Ele liga a chave `start-requested` do GSettings, e a extensão inicia o timer (ou continua, se estiver pausado) e desliga a chave. Com o timer já contando, não faz nada.

## Sons

Usar **sons do próprio sistema** (tema de sons freedesktop), sem instalar nada e sem arquivos externos. Tocar pela API do GNOME Shell (`global.display.get_sound_player().play_from_theme(...)`), pelo nome do som.

| Momento | Som (confirmado em 27/10/2026) |
|---|---|
| Fim do estudo (X) | `alarm-clock-elapsed` |
| Fim do descanso (Y) | `service-login` |
| Fim da última sessão | `complete` |

- Para ouvir um som: `canberra-gtk-play -i <nome>`
- Outras opções: `message`, `dialog-information`, `phone-incoming-call`, `window-attention`
- Ideia futura: deixar o usuário trocar os sons nas configurações.

## Decisões pendentes

Nenhuma no momento.

## Status

- [x] Pasta do projeto criada (`~/Documentos/projetos/timer`)
- [x] Definir comportamento, sons e controles
- [x] Confirmar os sons (`bell` foi trocado por `service-login`)
- [x] Criar a extensão (v0.1: `pomodoro-timer@lucasprado`, nome "Pomodoro Timer"; repositório github.com/Pradolp/Pomodoro-Timer)
- [x] Testar localmente
- [x] Release v0.1 no GitHub (.zip + passo a passo no README), para instalar sem esperar o extensions.gnome.org
- [ ] Publicar no extensions.gnome.org

## Onde paramos (27/10/2026, ~11h)

- A extensão foi instalada com `./scripts/install.sh`, que cria um link em `~/.local/share/gnome-shell/extensions/pomodoro-timer@lucasprado` apontando para a pasta do projeto.
- O primeiro `gnome-extensions enable` respondeu "não existe" porque a instalação aconteceu depois do login. O GNOME só procura extensões novas quando a sessão começa.
- Próximo passo: o usuário encerra a sessão, entra de novo e roda `gnome-extensions enable pomodoro-timer@lucasprado`.
- Ao voltar, perguntar se o timer apareceu na barra superior e seguir com o teste:
  - Usar tempos curtos nas preferências (`gnome-extensions prefs pomodoro-timer@lucasprado`), por exemplo 3 sessões de 1 min de estudo e 1 min de descanso.
  - Conferir o texto na barra (📚/☕ e contagem das sessões) e que não há descanso depois da última sessão.
  - Conferir que no fim do ciclo toca o som `complete` e o timer volta ao início.
  - Conferir pausar/continuar, pular etapa, parar, os sons e as notificações.
  - Para ver erros: `journalctl -f -o cat /usr/bin/gnome-shell`.
- Depois do teste: confirmar os sons, corrigir o que aparecer e gerar o pacote (`./scripts/pack.sh`) para publicar.
