document.addEventListener('DOMContentLoaded', () => {
    (function(w, a) {
        //"use strict";
        async function build(elem, yandexmapProps)
        {
            try
            {
                await ymaps3.ready;
            }
            catch (e)
            {
                console.log(e);
                console.log('wtyoothemeyandexmap: Ошибка при загрузке API Яндекс Карт. Пожалуйста, укажите верный ключ API в настройках плагина!');
                return;
            }

            const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
            const {YMapDefaultMarker} = await ymaps3.import('@yandex/ymaps3-markers@0.0.1');
            const {YMapClusterer, clusterByGrid} = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');

            // Отступ карты - 25% от меньшей величины размеров карты
            const marginPx = Math.min(elem.clientWidth, elem.clientHeight) / 4;

            const cfg = {
                location: {
                    center: [yandexmapProps['center_lng'], yandexmapProps['center_lat']],
                    zoom: yandexmapProps['zoom'],
                },
                showScaleInCopyrights: true,
                behaviors: [],
                margin: [marginPx, marginPx, marginPx, marginPx]
            };

            if (yandexmapProps['dragging'])
            {
                cfg.behaviors.push('drag');
            }

            if (yandexmapProps['zooming'])
            {
                cfg.behaviors.push('scrollZoom', 'pinchZoom');
                cfg.zoomRange = {
                    min: parseInt(yandexmapProps['min_zoom']),
                    max: parseInt(yandexmapProps['max_zoom'])
                };
            }

            // при использовании компонента uk-height-viewport с параметром offset-top: true,
            // скрипт вычисляет значение min-height. Так как контейнер для яндекс карт должен иметь атрибут height,
            // здесь мы просто присваиваем атрибуту height вычисленное значение min-height.
            if (elem.__uikit__.heightViewport)
            {
                elem.style.height = elem.__uikit__.heightViewport._data.minHeight;
            }
            //
            const map = new ymaps3.YMap(elem, cfg);
            switch (yandexmapProps['type']) {
                case 'satellite':
                    map.addChild(new ymaps3.YMapDefaultSatelliteLayer());
                    break;
                case 'scheme':
                default:
                    map.addChild(new ymaps3.YMapDefaultSchemeLayer({
                        theme: yandexmapProps['map_theme']
                    }));
                    break;
            }
            map.addChild(new ymaps3.YMapDefaultFeaturesLayer());

            if (yandexmapProps['show_zoom_controls'])
            {
                map.addChild(new ymaps3.YMapControls({position: 'right'})
                    .addChild(new YMapZoomControl())
                );
            }

            let lastMarkerWithOpenedPopup = null;
            const k = 'ymaps3x0--default-marker__';
            class CustomMarker extends YMapDefaultMarker
            {
                _createPopup() {
                    const {position: e, content: t, hidesMarker: o} = this._popupProps;
                    if (this._popup ? this._popup.innerHTML = "" : this._popup = document.createElement("ymaps"),
                        this._popup.className = `${k}popup_${o ? "center" : e} ${k}hider`,
                    "string" == typeof t) {
                        this._popup.classList.add(`${k}popup`);
                        const e = document.createElement("ymaps");
                        e.className = `${k}popup-container`;
                        // set popup padding
                        if (this._props.markerProps['popup_padding'] || this._props.props['popup_padding'])
                        {
                            e.className += ' ' + (this._props.markerProps['popup_padding'] || this._props.props['popup_padding']);
                        }
                        e.innerHTML = t;
                        // set popup minimum width
                        if (this._props.props['popup_min_width'])
                        {
                            e.style.minWidth = this._props.props['popup_min_width'];
                        }
                        // set popup maximum width
                        if (this._props.props['popup_max_width'])
                        {
                            e.style.maxWidth = this._props.props['popup_max_width'];
                        }
                        //
                        this._popup.appendChild(e);
                        const o = document.createElement("button");
                        o.className = `${k}popup__close`;
                        o.textContent = "✖";
                        o.onclick = ()=>this._togglePopup(!1);
                        this._popup.appendChild(o);
                    } else
                        this._popup.appendChild(t((()=>this._togglePopup(!1))));
                    return this._popup
                }

                _togglePopup(e)
                {
                    // Если всплывающее окно уже открыто - ничего не делаем
                    if (e && this._popupIsOpen)
                    {
                        return;
                    }

                    // Закрываем все остальные всплывающие окна
                    if (e && lastMarkerWithOpenedPopup && lastMarkerWithOpenedPopup !== this)
                    {
                        lastMarkerWithOpenedPopup._togglePopup(0);
                    }

                    super._togglePopup(e);

                    if (e)
                    {
                        lastMarkerWithOpenedPopup = this;
                    }
                }

                _createMarker() {
                    const marker = super._createMarker();
                    if (this._props.markerProps['show_popup'])
                    {
                        super._togglePopup(1);
                    }
                    return marker;
                }

                _image(icon, width, height)
                {
                    const elem = document.createElement('img');
                    elem.src = icon;
                    if (width)
                    {
                        elem.style.width = width + 'px';
                    }
                    if (height)
                    {
                        elem.style.height = height + 'px';
                        elem.style.position = 'absolute';
                        elem.style.top = 'calc(50% - ' + (height / 2) + 'px)';
                    }

                    return elem;
                }

                _createContainer()
                {
                    const e = (e,t)=> {
                        const o = document.createElement("ymaps");
                        return t && (o.className = k + t),
                            e.appendChild(o)
                    };
                    this._container = document.createElement("ymaps");
                    const t = e(this._container, "view")
                        , o = e(t, "icon");
                    if (this._props.markerProps['marker_icon'] || this._props.props['marker_icon'])
                    {
                        o.appendChild(this._image(
                            this._props.markerProps['marker_icon'] || this._props.props['marker_icon'],
                            this._props.markerProps['marker_icon_width'] || this._props.props['marker_icon_width'],
                            this._props.markerProps['marker_icon_height'] || this._props.props['marker_icon_height']
                        ));
                    }
                    else
                    {
                        e(o, "icon-box").innerHTML = '<svg viewBox="0 0 60 68" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <defs>\n        <path\n            d="M23.51 51.523a.5.5 0 0 1-.5.477c-.29 0-.51-.21-.52-.477-.145-3.168-1.756-5.217-4.832-6.147C7.53\n            42.968 0 33.863 0 23 0 10.297 10.297 0 23 0s23 10.297 23 23c0 10.863-7.53 19.968-17.658 22.376-3.076.93-4.687\n            2.98-4.83 6.147z"\n            id="&-id-svg-filter">\n        </path>\n        <filter x="-21.7%" y="-15.4%" width="143.5%" height="138.5%" filterUnits="objectBoundingBox" id="&-svg-filter">\n        <feGaussianBlur in="SourceGraphic" stdDeviation="3"></feGaussianBlur>\n        <feComponentTransfer>\n            <feFuncA type="linear" slope=".3"></feFuncA>\n        </feComponentTransfer>\n        </filter>\n    </defs>\n    <g fill="none" fill-rule="evenodd">\n        <g fill-rule="nonzero" transform="translate(7 5)" fill="currentColor">\n            <use filter="url(#&-svg-filter)" xlink:href="#&-id-svg-filter"></use>\n            <use xlink:href="#&-id-svg-filter"></use>\n        </g>\n        <path d="M30 68c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#fff" fill-rule="nonzero"></path>\n        <path d="M30 66a2 2 0 1 0 .001-3.999A2 2 0 0 0 30 66z" fill="currentColor"></path>\n    </g>\n</svg>';
                    }
                    const n = e(o);
                    e(n, "icon-dot");
                    const p = e(t, "title-box")
                        , i = e(p, "title-wrapper")
                        , r = e(i, "title");
                    this._props.title && (r.innerHTML = this._props.title);
                    const s = e(i, "subtitle");
                    return this._props.subtitle && (s.innerHTML = this._props.subtitle),
                    this._props.popup && (this._container.style.cursor = "pointer"),
                        this._container.style.color = this._props.color,
                        this._container
                }
            }

            if (yandexmapProps['markers'])
            {
                const isClustering = yandexmapProps['clustering'] === true;
                const markerCoordinates = [];
                for (const markerData of yandexmapProps['markers'])
                {
                    let contentHTML = '';
                    contentHTML += popupImage(yandexmapProps, markerData);
                    contentHTML += popupElem('title', yandexmapProps, markerData['title']);
                    contentHTML += popupElem('meta', yandexmapProps, markerData['meta']);
                    contentHTML += popupElem('content', yandexmapProps, markerData['content'], false);
                    contentHTML += popupLink(yandexmapProps, markerData);

                    const [lat, lng] = markerData['location'].split(',');
                    if (isNaN(lat) || isNaN(lng))
                    {
                        continue;
                    }

                    const markerCfg = {
                        coordinates: [parseFloat(lng).toFixed(6), parseFloat(lat).toFixed(6)],
                        popup: {content: contentHTML, position: 'left'},
                        props: yandexmapProps,
                        markerProps: markerData
                    };
                    if (yandexmapProps['show_title'] && markerData['title'])
                    {
                        markerCfg.title = markerData['title'];
                    }

                    markerCoordinates.push(new CustomMarker(markerCfg));
                }
                // перемещаем карту к последнему добавленному маркеру
                if (markerCoordinates.length > 0)
                {
                    const [lastMarkerLng, lastMarkerLat] = markerCoordinates[markerCoordinates.length - 1].coordinates;
                    map.update({location:{center: [lastMarkerLng, lastMarkerLat], duration: 400}});
                }
                //

                if (isClustering)
                {
                    const featureList = markerCoordinates.map((value, i) => ({
                        type: 'Feature',
                        id: i,
                        geometry: {
                            coordinates: value.coordinates,
                            element: value
                        }
                    }));

                    const markerRendering = (feature) => feature.geometry.element;
                    const clusterRendering = (coordinates, features) => {
                        return new ymaps3.YMapMarker({
                            coordinates: coordinates,
                            onClick() {
                                const bounds = getBounds(features.map(feature => feature.geometry.coordinates));
                                map.update({location: {bounds: bounds, easing: 'ease-in-out', duration: 250}});
                            }
                        }, cluster(features.length).cloneNode(true));
                    }

                    const clusterer = new YMapClusterer({
                        method: clusterByGrid({ gridSize: 64 }),
                        features: featureList,
                        marker: markerRendering,
                        cluster: clusterRendering
                    });
                    map.addChild(clusterer);
                }
                else
                {
                    markerCoordinates.forEach(value => {
                        map.addChild(value);
                    });
                }

                // Закрываем всплывающее окно при клике вне его области
                map.addChild(new ymaps3.YMapListener({
                    layer: 'any',
                    onClick: (object, event) => {
                        if (lastMarkerWithOpenedPopup && !object)
                        {
                            lastMarkerWithOpenedPopup._togglePopup(0);
                        }
                    }
                }));
            }
        }

        w.component("Yandexmap", {
            connected() {
                if (this.script || (this.script = a.$("script", this.$el)),
                    !this.script)
                    return;
                const yandexmapProps = JSON.parse(this.script.textContent);
                build(this.$el, yandexmapProps);
            }
        })
    })(UIkit, UIkit.util);
});

function cluster(count)
{
    const clusterEl = document.createElement('div');
    clusterEl.classList.add('circle');
    clusterEl.style = "cursor: pointer; width: 48px; height: 48px; background-color: rgb(255, 51, 51); border-radius: 50%; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center;";
    clusterEl.innerHTML = `<span style="color: white; font-size: 1.5rem" class="circle-text">${count}</span>`;
    return clusterEl;
}

function getBounds(coordinates)
{
    let minLat = Infinity, minLng = Infinity;
    let maxLat = -Infinity, maxLng = -Infinity;

    for (const coords of coordinates)
    {
        const lat = coords[1];
        const lng = coords[0];

        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    }

    return [
        [minLng, minLat],
        [maxLng, maxLat]
    ];
}

function popupLink(props, marker)
{
    if (!props['show_link'] || !marker['link'])
    {
        return '';
    }

    const link = document.createElement('div');
    setTopMargin(link, props['link_margin']);
    const aLink = document.createElement('a');
    aLink.href = marker['link'];
    if (props['link_target'])
    {
        aLink.target = '_blank';
    }
    if (marker['link_aria_label'] || props['link_aria_label'])
    {
        aLink.ariaLabel = marker['link_aria_label'] || props['link_aria_label'];
    }
    aLink.textContent = marker['link_text'] || props['link_text'];
    if (props['link_style'])
    {
        if (props['link_style'] === 'link-muted' || props['link_style'] === 'link-text')
        {
            aLink.classList.add('uk-' + props['link_style']);
        }
        // button type styles
        else
        {
            aLink.classList.add('uk-button', 'uk-button-' + props['link_style']);
            addOptionalClass(aLink, 'uk-button-', props['link_size']);
            if (props['link_fullwidth'])
            {
                aLink.classList.add('uk-width-1-1');
            }
        }
    }
    link.appendChild(aLink);

    return link.outerHTML;
}

function popupImage(props, marker)
{
    if (!props['show_image'] || !marker['image'])
    {
        return '';
    }

    const img = document.createElement('img');
    img.src = marker['image'];
    if (marker['image_alt'])
    {
        img.alt = marker['image_alt'];
    }
    img.loading = props['image_loading'] ? 'eager' : 'lazy';
    if (props['image_width'])
    {
        img.width = props['image_width'];
    }
    if (props['image_height'])
    {
        img.height = props['image_height'];
    }
    if (props['image_border'])
    {
        img.classList.add('uk-border-' + props['image_border']);
    }

    return img.outerHTML;
}

function popupElem(type, props, value, isTextContent = true)
{
    if (!props['show_' + type] || !value)
    {
        return '';
    }

    const elem = document.createElement(props[type + '_element'] || 'div');
    setTopMargin(elem, props[type + '_margin']);
    addOptionalClass(elem, 'uk-text-', props[type + '_color']);
    addOptionalClass(elem, 'uk-', props[type + '_style']);
    addOptionalClass(elem, 'uk-heading-', props[type + '_decoration']);
    addOptionalClass(elem, 'uk-font-', props[type + '_font_family']);
    if (isTextContent)
    {
        elem.textContent = value;
    }
    else
    {
        elem.innerHTML = value;
    }

    return elem.outerHTML;
}

function setTopMargin(elem, margin)
{
    let className = 'uk-margin-';
    if (margin)
    {
        className += margin + '-';
    }
    className += 'top';
    elem.classList.add(className);
}

function addOptionalClass(elem, prefix, value)
{
    if (value)
    {
        elem.classList.add(prefix + value);
    }
}