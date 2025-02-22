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

use YOOtheme\YandexMapApiHelper;

return [
    'transforms' => [
        'render' => function ($node) {
            if (empty($node->props))
            {
                return false;
            }

            $yandexmap_api = YandexMapApiHelper::getYandexMapApi();

            if (!$yandexmap_api)
            {
                return false;
            }

            $node->props['metadata'] = [];
            // Подключаем API 3.0 Яндекс карт
            $node->props['metadata']['script:plg.system.wtyoothemeyandexmap_api'] = [
                'src' => $yandexmap_api
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
