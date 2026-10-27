// Interface na barra superior: o texto do timer e o menu com os controles.

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Phase, PhaseEnd, PomodoroTimer} from './timer.js';

const PHASE_EMOJI = {
    [Phase.IDLE]: '🍅',
    [Phase.STUDY]: '📚',
    [Phase.BREAK]: '☕',
};

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const PomodoroIndicator = GObject.registerClass(
class PomodoroIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, extension.metadata.name, false);

        this._extension = extension;
        this._settings = extension.getSettings();

        this._label = new St.Label({
            style_class: 'pomodoro-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this._timer = new PomodoroTimer({
            onChanged: () => this._sync(),
            onPhaseEnd: (event, info) => this._onPhaseEnd(event, info),
        });

        this._buildMenu();
        this._settings.connectObject('changed', () => this._sync(), this);
        this._sync();
    }

    _buildMenu() {
        this._statusItem = new PopupMenu.PopupMenuItem('', {reactive: false, can_focus: false});
        this._statusItem.add_style_class_name('pomodoro-status');
        this.menu.addMenuItem(this._statusItem);

        const controlsItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        const controls = new St.BoxLayout({
            style_class: 'pomodoro-controls',
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
        });
        controlsItem.add_child(controls);
        this.menu.addMenuItem(controlsItem);

        this._playPauseButton = this._makeButton('media-playback-start-symbolic', 'Iniciar',
            () => this._onPlayPause());
        this._skipButton = this._makeButton('media-skip-forward-symbolic', 'Pular etapa',
            () => this._timer.skip());
        this._stopButton = this._makeButton('media-playback-stop-symbolic', 'Parar',
            () => this._timer.stop());
        controls.add_child(this._playPauseButton);
        controls.add_child(this._skipButton);
        controls.add_child(this._stopButton);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addAction('Configurações', () => this._extension.openPreferences());
    }

    _makeButton(iconName, accessibleName, callback) {
        const button = new St.Button({
            style_class: 'icon-button pomodoro-button',
            accessible_name: accessibleName,
            can_focus: true,
            child: new St.Icon({icon_name: iconName}),
        });
        button.connect('clicked', callback);
        return button;
    }

    _onPlayPause() {
        if (!this._timer.running) {
            this._timer.start({
                sessions: this._settings.get_int('sessions'),
                studyMinutes: this._settings.get_int('study-minutes'),
                breakMinutes: this._settings.get_int('break-minutes'),
            });
        } else if (this._timer.paused) {
            this._timer.resume();
        } else {
            this._timer.pause();
        }
    }

    _onPhaseEnd(event, {session, total}) {
        const breakMinutes = this._settings.get_int('break-minutes');

        switch (event) {
        case PhaseEnd.STUDY:
            this._alert('study-end-sound', 'Hora do descanso ☕',
                `Sessão ${session} de ${total} concluída. Descanso de ${breakMinutes} min.`);
            break;
        case PhaseEnd.BREAK:
            this._alert('break-end-sound', 'De volta aos estudos 📚',
                `Começando a sessão ${session + 1} de ${total}.`);
            break;
        case PhaseEnd.FINISHED:
            this._alert('finished-sound', 'Sessões concluídas 🎉',
                `Você completou ${total} ${total === 1 ? 'sessão' : 'sessões'} de estudo.`);
            break;
        }
    }

    _alert(soundKey, title, body) {
        global.display.get_sound_player().play_from_theme(
            this._settings.get_string(soundKey), title, null);
        Main.notify(title, body);
    }

    _sync() {
        const timer = this._timer;

        if (!timer.running) {
            this._label.text = PHASE_EMOJI[Phase.IDLE];
            const sessions = this._settings.get_int('sessions');
            this._statusItem.label.text =
                `${sessions} × ${this._settings.get_int('study-minutes')} min de estudo, ` +
                `${this._settings.get_int('break-minutes')} min de descanso`;
        } else {
            const pausedMark = timer.paused ? '⏸ ' : '';
            this._label.text = `${pausedMark}${PHASE_EMOJI[timer.phase]} ` +
                `${timer.session}/${timer.totalSessions} · ${formatTime(timer.remainingSeconds)}`;
            const phaseName = timer.phase === Phase.STUDY ? 'Estudo' : 'Descanso';
            this._statusItem.label.text = `${phaseName} · sessão ${timer.session} de ` +
                `${timer.totalSessions}${timer.paused ? ' (pausado)' : ''}`;
        }

        const showPlay = !timer.running || timer.paused;
        this._playPauseButton.child.icon_name = showPlay
            ? 'media-playback-start-symbolic'
            : 'media-playback-pause-symbolic';
        this._playPauseButton.accessible_name = !timer.running
            ? 'Iniciar'
            : timer.paused ? 'Continuar' : 'Pausar';
        this._skipButton.visible = timer.running;
        this._stopButton.visible = timer.running;
    }

    destroy() {
        this._timer.destroy();
        this._settings.disconnectObject(this);
        this._settings = null;
        super.destroy();
    }
});

export default class PomodoroExtension extends Extension {
    enable() {
        this._indicator = new PomodoroIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        // A extensão continua ativa com a tela bloqueada (session-modes no
        // metadata.json) para o timer não zerar; só o indicador fica escondido.
        this._sessionModeId = Main.sessionMode.connect('updated',
            () => this._syncSessionMode());
        this._syncSessionMode();
    }

    disable() {
        Main.sessionMode.disconnect(this._sessionModeId);
        this._sessionModeId = 0;
        this._indicator.destroy();
        this._indicator = null;
    }

    _syncSessionMode() {
        const locked = Main.sessionMode.isLocked;
        if (locked)
            this._indicator.menu.close();
        this._indicator.visible = !locked;
    }
}
