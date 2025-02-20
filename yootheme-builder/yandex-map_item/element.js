document.addEventListener('DOMContentLoaded', () =>
{
    (function(w, a) {
        "use strict";
        async function build(elem, inputEl)
        {
            await ymaps3.ready;
            const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
            const {YMapDefaultMarker} = await ymaps3.import('@yandex/ymaps3-markers@0.0.1');

            const [lat, lng] = inputEl.value.split(',');

            const map = new ymaps3.YMap(elem, {
                location: {
                    center: [parseFloat(lng), parseFloat(lat)],
                    zoom: 9
                },
                showScaleInCopyrights: true
            });
            map.addChild(new ymaps3.YMapDefaultSchemeLayer());
            map.addChild(new ymaps3.YMapDefaultFeaturesLayer());
            map.addChild(new ymaps3.YMapControls({position: 'right'})
                .addChild(new YMapZoomControl())
            );

            const draggableMarker = new YMapDefaultMarker({
                coordinates: [parseFloat(lng), parseFloat(lat)],
                draggable: true,
                onDragEnd: (crds) =>
                {
                    const lat = crds[1].toFixed(6);
                    const lng = crds[0].toFixed(6);

                    map.update({location:{center:[lng, lat], duration:400}});
                    inputEl.value = lat + ',' + lng;
                    inputEl.dispatchEvent(new Event('input'));
                }
            });
            map.addChild(draggableMarker);
            map.addChild(new ymaps3.YMapListener({
                onClick: (obj, ev) =>
                {
                    const lat = ev.coordinates[1].toFixed(6);
                    const lng = ev.coordinates[0].toFixed(6);

                    draggableMarker.update({coordinates:[lng, lat]});
                    map.update({location:{center:[lng, lat], duration:400}});
                    inputEl.value = lat + ',' + lng;
                    inputEl.dispatchEvent(new Event('input'));
                },
            }));
            inputEl.onchange = (ev) =>
            {
                let [new_lat, new_lng] = ev.target.value.split(',');
                if (isNaN(new_lat) || isNaN(new_lng))
                {
                    return;
                }
                new_lat = parseFloat(new_lat).toFixed(6);
                new_lng = parseFloat(new_lng).toFixed(6);

                draggableMarker.update({coordinates:[new_lng, new_lat]});
                map.update({location:{center:[new_lng, new_lat], duration:400}});
            };
        }

        w.component("Yandexmaplocation",
        {
            connected() {
                const mapContainer = document.createElement('div');
                mapContainer.style = "height: 260px";
                this.$el.insertAdjacentElement('beforebegin', mapContainer);
                build(mapContainer, this.$el);
            }
        })
    })(UIkit, UIkit.util);
});