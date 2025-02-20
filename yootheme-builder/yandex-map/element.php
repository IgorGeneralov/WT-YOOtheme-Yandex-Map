<?php
/**
 * @package       WT YOOTheme Yandex Map
 * @version       1.1.0
 * @Author        Andrey Smirnikov, https://web-tolk.ru
 * @copyright     Copyright (C) 2024 Andrey Smirnikov
 * @license       GNU/GPL http://www.gnu.org/licenses/gpl-3.0.html
 * @since         1.0.0
 */

namespace YOOtheme;

use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;

return [
    'transforms' => [
        'render' => function ($node) {
            if (empty($node->props))
            {
                return false;
            }

            $plugin = PluginHelper::getPlugin('system', 'wtyoothemeyandexmap');
            $params = json_decode($plugin->params);
            $yandex_map_api_entry_point_free = 'https://api-maps.yandex.ru/3.0';
            $yandex_map_api_entry_point_paid = 'https://enterprise.api-maps.yandex.ru/3.0';
            $entrypoint = $params->yandex_map_api_type === 'free' ? $yandex_map_api_entry_point_free : $yandex_map_api_entry_point_paid;
            $api_key = json_decode($plugin->params)->yandex_map_api_key;
            $lang = str_replace('-', '_', Factory::getApplication()->getLanguage()->getTag());

            $node->props['metadata'] = [];
            // Подключаем API 3.0 Яндекс карт
            $node->props['metadata']['script:plg.system.wtyoothemeyandexmap_api'] = [
                'src' => "{$entrypoint}/?apikey={$api_key}&lang={$lang}"
            ];
            // Собственный скрипт элемента
            $node->props['metadata']['script:plg.system.wtyoothemeyandexmap_element'] = [
                'src' => 'plugins/system/wtyoothemeyandexmap/yootheme-builder/yandex-map/element.js'
            ];
            // Стиль элемента
            $node->props['metadata']['style:plg.system.wtyoothemeyandexmap_popup_style'] = [
                'href' => 'plugins/system/wtyoothemeyandexmap/yootheme-builder/yandex-map/element.css'
            ];
            
            foreach ($node->children as $child)
            {
                if (empty($child->props['location'])) {
                    continue;
                }

                if (!empty($child->props['hide'])) {
                    continue;
                }

                $node->props['markers'][] = $child->props;
            }

            return true;
        }
    ]
];
