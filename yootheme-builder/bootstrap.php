<?php
/**
 * @package       WT YOOTheme Yandex Map
 * @version       1.1.0
 * @Author        Andrey Smirnikov, https://web-tolk.ru
 * @copyright     Copyright (C) 2024 Andrey Smirnikov
 * @license       GNU/GPL http://www.gnu.org/licenses/gpl-3.0.html
 * @since         1.0.0
 */

include_once __DIR__ . '/src/CustomizerListener.php';

use YOOtheme\Builder;
use YOOtheme\Path;

return [
    'extend' => [
        Builder::class => function (Builder $builder)
        {
            $builder->addTypePath(Path::get('./*/element.json'));
        }
    ],
    'events' => [
        'customizer.init' => [
            CustomizerListener::class => 'init'
        ]
    ]
];