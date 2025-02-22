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
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\PluginHelper;

class YandexMapApiHelper
{
    public static function getYandexMapApi(): string|bool
    {
        $plugin = PluginHelper::getPlugin('system', 'wtyoothemeyandexmap');
        $params = json_decode($plugin->params);
        $yandex_map_api_entry_point_free = 'https://api-maps.yandex.ru/3.0';
        $yandex_map_api_entry_point_paid = 'https://enterprise.api-maps.yandex.ru/3.0';

        // Бесплатная версия по умолчанию
        $entrypoint = $yandex_map_api_entry_point_free;

        if ($params->yandex_map_api_type === 'paid')
        {
            $entrypoint = $yandex_map_api_entry_point_paid;
        }

        $api_key = $params->yandex_map_api_key;

        if (empty($api_key))
        {
            Factory::getApplication()->getLanguage()->load('plg_system_wtyoothemeyandexmap', JPATH_ADMINISTRATOR);
            Factory::getApplication()->enqueueMessage($plugin->name . ': ' . Text::_('PLG_WTYOOTHEMEYANDEXMAP_ERROR_API_KEY_NEEDED'), 'error');
            return false;
        }

        $lang = str_replace('-', '_', Factory::getApplication()->getLanguage()->getTag());

        return "{$entrypoint}/?apikey={$api_key}&lang={$lang}";
    }
}