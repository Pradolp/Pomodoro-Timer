// Lógica do ciclo Pomodoro, sem nenhuma interface.
//
// Com N sessões o ciclo é: estudo → descanso → ... → estudo → fim,
// ou seja, N estudos e N − 1 descansos. Ao terminar, volta ao estado parado.

import GLib from 'gi://GLib';

export const Phase = Object.freeze({
    IDLE: 'idle',
    STUDY: 'study',
    BREAK: 'break',
});

// Eventos passados para onPhaseEnd quando uma etapa termina sozinha.
export const PhaseEnd = Object.freeze({
    STUDY: 'study-end',
    BREAK: 'break-end',
    FINISHED: 'finished',
});

const USEC_PER_SEC = 1_000_000;

// Quando o estudo termina sozinho, o descanso só começa a contar depois
// desta espera, que é o tempo do alarme parar de tocar.
const BREAK_START_DELAY_US = 5 * USEC_PER_SEC;

export class PomodoroTimer {
    /**
     * @param {object} callbacks
     * @param {() => void} callbacks.onChanged - chamado a cada segundo e a cada mudança de estado
     * @param {(event: string, info: {session: number, total: number}) => void} callbacks.onPhaseEnd
     *   chamado quando uma etapa chega ao fim sozinha (não ao pular ou parar)
     */
    constructor({onChanged, onPhaseEnd}) {
        this._onChanged = onChanged;
        this._onPhaseEnd = onPhaseEnd;
        this._tickId = 0;
        this._reset();
    }

    get phase() {
        return this._phase;
    }

    get session() {
        return this._session;
    }

    get totalSessions() {
        return this._config?.sessions ?? 0;
    }

    get paused() {
        return this._paused;
    }

    get running() {
        return this._phase !== Phase.IDLE;
    }

    /** Segundos restantes na etapa atual, arredondados para cima (50:00 no início, não 49:59). */
    get remainingSeconds() {
        const remaining = this._paused
            ? this._remainingUs
            : this._endTime - GLib.get_monotonic_time();
        // Durante a espera antes do descanso, o tempo fica parado no total.
        const clamped = Math.min(remaining, this._durationUs);
        return Math.max(0, Math.ceil(clamped / USEC_PER_SEC));
    }

    /**
     * @param {object} config
     * @param {number} config.sessions
     * @param {number} config.studyMinutes
     * @param {number} config.breakMinutes
     */
    start(config) {
        this._config = {...config};
        this._session = 1;
        this._startPhase(Phase.STUDY);
    }

    pause() {
        if (!this.running || this._paused)
            return;
        this._remainingUs = this._endTime - GLib.get_monotonic_time();
        this._paused = true;
        this._stopTicking();
        this._onChanged();
    }

    resume() {
        if (!this.running || !this._paused)
            return;
        this._endTime = GLib.get_monotonic_time() + this._remainingUs;
        this._paused = false;
        this._startTicking();
        this._onChanged();
    }

    /** Vai para a próxima etapa sem tocar som nem notificar. */
    skip() {
        if (this.running)
            this._advance(false);
    }

    stop() {
        this._stopTicking();
        this._reset();
        this._onChanged();
    }

    destroy() {
        this._stopTicking();
        this._onChanged = () => {};
        this._onPhaseEnd = () => {};
    }

    _reset() {
        this._phase = Phase.IDLE;
        this._session = 0;
        this._paused = false;
        this._endTime = 0;
        this._remainingUs = 0;
        this._durationUs = 0;
    }

    /** @param {number} [delayUs] - espera antes de a contagem começar */
    _startPhase(phase, delayUs = 0) {
        const minutes = phase === Phase.STUDY
            ? this._config.studyMinutes
            : this._config.breakMinutes;

        this._phase = phase;
        this._paused = false;
        this._durationUs = minutes * 60 * USEC_PER_SEC;
        this._remainingUs = this._durationUs + delayUs;
        this._endTime = GLib.get_monotonic_time() + this._remainingUs;
        this._startTicking();
        this._onChanged();
    }

    _advance(natural) {
        const info = {session: this._session, total: this.totalSessions};
        let event;

        if (this._phase === Phase.STUDY && this._session < this.totalSessions) {
            event = PhaseEnd.STUDY;
            this._startPhase(Phase.BREAK, natural ? BREAK_START_DELAY_US : 0);
        } else if (this._phase === Phase.BREAK) {
            event = PhaseEnd.BREAK;
            this._session++;
            this._startPhase(Phase.STUDY);
        } else {
            event = PhaseEnd.FINISHED;
            this.stop();
        }

        if (natural)
            this._onPhaseEnd(event, info);
    }

    _startTicking() {
        this._stopTicking();
        this._tickId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            if (GLib.get_monotonic_time() >= this._endTime) {
                // _advance recria o timeout, então este precisa ser descartado.
                this._tickId = 0;
                this._advance(true);
                return GLib.SOURCE_REMOVE;
            }
            this._onChanged();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopTicking() {
        if (this._tickId) {
            GLib.source_remove(this._tickId);
            this._tickId = 0;
        }
    }
}
