// Janela de configurações (aberta pelo app Extensões ou pelo menu do timer).

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PomodoroPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Geral',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Ciclo',
            description: 'As mudanças valem a partir do próximo início.',
        });
        page.add(group);

        const addSpinRow = (key, title, subtitle, lower, upper) => {
            const row = new Adw.SpinRow({
                title,
                subtitle,
                adjustment: new Gtk.Adjustment({
                    lower,
                    upper,
                    step_increment: 1,
                    page_increment: 5,
                }),
            });
            settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
            group.add(row);
        };

        addSpinRow('sessions', 'Sessões', 'Quantos blocos de estudo', 1, 20);
        addSpinRow('study-minutes', 'Estudo', 'Minutos por sessão', 1, 240);
        addSpinRow('break-minutes', 'Descanso', 'Minutos entre as sessões', 1, 120);
    }
}
