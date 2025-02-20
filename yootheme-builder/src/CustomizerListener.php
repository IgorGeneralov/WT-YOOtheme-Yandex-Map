<?php
/**
 * @package       WT YOOTheme Yandex Map
 * @version       1.1.0
 * @Author        Andrey Smirnikov, https://web-tolk.ru
 * @copyright     Copyright (C) 2024 Andrey Smirnikov
 * @license       GNU/GPL http://www.gnu.org/licenses/gpl-3.0.html
 * @since         1.0.0
 */

use YOOtheme\Config;
use YOOtheme\Path;
use YOOtheme\Translator;

class CustomizerListener
{
    public static function init(Config $config, Translator $translator): void
    {
        /* @var $wa \Joomla\CMS\WebAsset\WebAssetManager */
        $wa = \Joomla\CMS\Factory::getApplication()->getDocument()->getWebAssetManager();
        $wa->registerAndUseScript('plg.system.wtyoothemeyandexmap_map_item', 'plugins/system/wtyoothemeyandexmap/yootheme-builder/yandex-map_item/element.js');
        
        $translator->addResource(Path::get("../yandex-map/languages/{$config('locale.code')}.json"));
    }
}