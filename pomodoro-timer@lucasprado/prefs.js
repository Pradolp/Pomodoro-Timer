// Janela de configurações (aberta pelo app Extensões ou pelo menu do timer).

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PomodoroPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Adw.PreferencesWindow nasce modal, e janelas modais só mostram o
        // botão de fechar. Sem isso, não aparecem minimizar e maximizar.
        window.modal = false;

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

        const spinRows = [];
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
            spinRows.push(row);
        };

        addSpinRow('sessions', 'Sessões', 'Quantos blocos de estudo', 1, 20);
        addSpinRow('study-minutes', 'Estudo', 'Minutos por sessão', 1, 240);
        addSpinRow('break-minutes', 'Descanso', 'Minutos entre as sessões', 1, 120);

        const startButton = new Gtk.Button({
            child: new Adw.ButtonContent({
                icon_name: 'media-playback-start-symbolic',
                label: 'Iniciar',
            }),
            halign: Gtk.Align.END,
            margin_top: 12,
            css_classes: ['suggested-action', 'pill'],
        });
        startButton.connect('clicked', () => {
            // Um número digitado só é salvo ao sair do campo; garante que o
            // ciclo comece com o valor que está na tela.
            spinRows.forEach(row => row.update());
            settings.set_boolean('start-requested', true);
        });
        group.add(startButton);
    }
}
