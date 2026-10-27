# Pomodoro Timer

Extensão do GNOME Shell com um timer Pomodoro na barra superior.

- Você define o número de sessões, o tempo de estudo e o tempo de descanso.
- O ciclo é automático: estudo → descanso → estudo … → fim. Com N sessões, há N − 1 descansos.
- No fim de cada etapa, toca um som do sistema e aparece uma notificação.
- Na barra: `📚 1/3 · 49:12` durante o estudo e `☕ 1/3 · 09:30` durante o descanso.
- Clicando no timer: ▶/⏸ iniciar, pausar ou continuar; ⏭ pular etapa; ⏹ parar.

Compatível com GNOME Shell 50.

## Instalar para desenvolvimento

```bash
./scripts/install.sh
```

No Wayland, saia da sessão e entre de novo. Depois ative a extensão:

```bash
gnome-extensions enable pomodoro-timer@lucasprado
```

Para ver erros da extensão:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

## Gerar o pacote para publicar

```bash
./scripts/pack.sh
```

O arquivo fica em `dist/`.
