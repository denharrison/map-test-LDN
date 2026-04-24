import L from 'leaflet'
import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'


interface MarkerType {
    id: string,
    latitude: number,
    longitude: number,
    name: string,
}


export const Map = () => {

    const mapObject = useRef<L.Map | null>(null);
    const mapHtmlElement = useRef<HTMLDivElement | null>(null);
    const layerGroup = useRef<L.LayerGroup | null>(null)
    const [markers, setMarkers] = useState<MarkerType[]>([])
    const [userCoordinates, setUserCoordinates ] = useState<MarkerType | null>(null)


 
    useEffect(() => {

     if (mapHtmlElement.current && !mapObject.current) {

     mapObject.current = L.map(mapHtmlElement.current).setView([51.505, -0.09], 13)
     
     L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png', {
        detectRetina: true,
     }).addTo(mapObject.current)

     layerGroup.current = L.layerGroup().addTo(mapObject.current)

     mapObject.current.on('click', (event) => {
        setMarkers((prev) => [ ...prev, { id: crypto.randomUUID(), latitude: event.latlng.lat, longitude: event.latlng.lng, name: 'Йоу, я новый маркер'} ])    
     })

     }

    if (layerGroup.current) {

    layerGroup.current.clearLayers()

     markers.forEach((marker) => {
        L.marker([marker.latitude, marker.longitude])
          .addTo(layerGroup.current)
          .bindPopup(
            `
          <div style="display: flex; flex-direction: column; gap: 5px;">   
            <p> ${marker.name} </p>
            <input id='input-${marker.id}' type='text' placeholder='Дайте маркеру имя'/>
            <button id='btn-${marker.id}'> Сохранить </button>
          </div>
        `,
          )
          .on("popupopen", () => {
            const input = document.getElementById(
              `input-${marker.id}`,
            ) as HTMLInputElement;
            const btn = document.getElementById(`btn-${marker.id}`);
            btn.onclick = () => {
              const newName = input.value;
              if (newName) {
                setMarkers((prev) =>
                  prev.map((m) =>
                    m.id === marker.id ? { ...m, name: newName } : m,
                  ),
                );
              }
            };
          });
        
     })
    }

    },[markers])

    return (
      <>
        <div style={{ height: "500px" }} ref={mapHtmlElement}></div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <h3>Вы можете создать маркер на карте указав координаты</h3>
          <input
            type="number"
            placeholder="Укажите широту"
            onChange={(event) => {
              setUserCoordinates((uc) => ({
                ...uc,
                latitude: Number(event.target.value),
              }));
            }}
          />
          <input
            type="number"
            placeholder="Укажите долготу"
            onChange={(event) => {
              setUserCoordinates((uc) => ({
                ...uc,
                longitude: Number(event.target.value),
              }));
            }}
          />
          <button
            type="button"
            onClick={() =>
              setMarkers((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  latitude: userCoordinates.latitude,
                  longitude: userCoordinates.longitude,
                  name: "Йоу, я маркер созданный по вашим координатам",
                },
              ])
            }
          >
            Создать новый маркер
          </button>
        </div>
      </>
    );

}