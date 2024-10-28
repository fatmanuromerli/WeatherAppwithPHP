const wrapper = document.querySelector(".wrapper"),
    inputPart = wrapper.querySelector(".input-part"),
    infoTxt = inputPart.querySelector(".info-txt"),
    inputField = inputPart.querySelector("input"),
    wIcon = document.querySelector(".weather-part img"),
    arrowBack = document.querySelector("header i");

let key = 'e015f644263d7dfc6fd26d20eb9d287c';

inputField.addEventListener("keyup", e => {
    if (e.key === "Enter" && inputField.value !== "") {
        let city = inputField.value;
        checkCityInDB(city);
    }
});

async function checkCityInDB(city) {
    try {
        const response = await fetch('http://localhost/havadurum/havadurum.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                city: city,
                operation: 'sehir'
            })
        });

        if (!response.ok) {
            throw new Error('Ağ hatası: ' + response.status);
        }

        const result = await response.json();
        let foundUL = document.getElementById("onerilensehirler");

        // baştan sıfırla
        while (foundUL.firstChild) {
            foundUL.removeChild(foundUL.firstChild);
        }

        const dbResponse = result.status;
        result.data.forEach(function (sonuc) {
            let foundLi = document.createElement("li");
            foundLi.innerText = sonuc.name;
            foundLi.className = "sehirsecenek";
            let i = document.createElement("i");
            i.className = "fa-solid fa-hand-pointer";
            foundLi.appendChild(i);
            foundUL.appendChild(foundLi);


            foundLi.addEventListener("click", () => {
                secilen_sehir = sonuc.name;



                if (dbResponse === '200') {

                    infoTxt.classList.remove("error");
                    infoTxt.innerText = "";
                    requestApi(secilen_sehir);
                    weatherDetails(secilen_sehir);

                    const favla = document.getElementById("favButton");
                    favla.addEventListener("click", () => {
                        addToFavorites(secilen_sehir);
                    });


                    // Arama başarılı olduunda listeyi sıfırla
                    while (foundUL.firstChild) {
                        foundUL.removeChild(foundUL.firstChild);
                    }
                    inputField.value = '';

                } else {
                    infoTxt.innerText = "Şehir bulunamadı!";
                    infoTxt.classList.add("error");

                    // Arama başarısız olduğunda listeyi aıfırla
                    while (foundUL.firstChild) {
                        foundUL.removeChild(foundUL.firstChild);
                    }
                    inputField.value = '';
                }
            });
        });

        console.log(dbResponse);

    } catch (error) {
        console.error('Veritabanı kontrolü sırasında hata oluştu:', error);
    }
}



function requestApi(city) {
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    fetch(api)
        .then(response => response.json())
        .then(result => weatherDetails(result));
}

function weatherDetails(info) {

    if (typeof info === 'string') {

        requestApi(info);
        return;
    }

    if (info.cod == "404") {
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} şehri bulunamadı...`;
    } else {

        const city = info.name || "Bilinmiyor";
        const country = (info.sys && info.sys.country) || "Bilinmiyor";
        const weather = info.weather ? info.weather[0] : null;
        const description = weather ? weather.description : "Tanımlanamayan hava durumu";
        const id = weather ? weather.id : null;
        const { feels_like, humidity, temp } = info.main || {};

        const wIcon = document.querySelector(".weather-part img");

        // Hava durumu ikonlarını ayarlama
        if (id === 800) {
            wIcon.src = "icons/clear.svg";
        } else if (id >= 200 && id <= 232) {
            wIcon.src = "icons/storm.svg";
        } else if (id >= 600 && id <= 622) {
            wIcon.src = "icons/snow.svg";
        } else if (id >= 701 && id <= 781) {
            wIcon.src = "icons/haze.svg";
        } else if (id >= 801 && id <= 804) {
            wIcon.src = "icons/cloud.svg";
        } else if ((id >= 300 && id <= 321) || (id >= 500 && id <= 531)) {
            wIcon.src = "icons/rain.svg";
        }

        if (temp !== undefined && feels_like !== undefined) {
            wrapper.querySelector(".temp .numb").innerText = Math.floor(temp - 273.15);
            wrapper.querySelector(".temp .numb-2").innerText = Math.floor(feels_like - 273.15);
        }

        wrapper.querySelector(".weather").innerText = description;
        wrapper.querySelector(".location").innerText = `${city}, ${country}`;
        wrapper.querySelector(".humidity span").innerText = `${humidity}%`;


        infoTxt.classList.remove("pending", "error");
        wrapper.classList.add("active");

        // ! Favori şehir ekleme butonunu etkinleştirme   BAŞKA YERE EKLE !
        // const favButton = document.createElement("button");
        // favButton.innerText = "Favorilere Ekle";
        // favButton.addEventListener("click", () => addToFavorites(city));
        // inputPart.appendChild(favButton);
    }
}


async function addToFavorites(city) {



    try {
        const response = await fetch('http://localhost/havadurum/havadurum.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                city: city,
                operation: 'favori'
            })
        });

        if (!response.ok) {
            throw new Error('Ağ hatası: ' + response.status);
        }

        const result = await response.json();
        const dbResponses = result.status;
        // Önce favorilerde olup olmadığını kontrol et
        if (dbResponses === '202') {
            checkIfFavorite(city);
            // alert(`${city} şehri zatwn FAVORİLERDE MECVCUT!`);
        }

        else if (dbResponses === '200') {
            alert(`${city} şehri favorilere eklendi!`);

        } else {
            alert(`Hata: ${result.message}`);
        }

    } catch (error) {
        console.error('Favori eklerken hata oluştu:', error);
    }
}

async function checkIfFavorite(city) {
    try {
        const response = await fetch('http://localhost/havadurum/havadurum.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                city: city,
                operation: 'favori'
            })
        });

        if (!response.ok) {
            throw new Error('Ağ hatası: ' + response.status);
        }

        const result = await response.json();

        // Şehir zaten favorilerdeyse uyarı ver
        if (result.status === '202') {
            alert(`${city} zaten favori listenizde!`);

        }

        return true;

    } catch (error) {
        console.error('Favori kontrolü sırasında hata oluştu:', error);
        return false;
    }
}


async function showFavorites(city) {
    try {
        // Favori şehirler getirme isteği
        const response = await fetch('http://localhost/havadurum/havadurum.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                city: city,
                operation: 'favorigetir'
            })
        });

        const result = await response.json();
        const gelenData = result.data;

        if (result.status === '200') {
            const favoriSehirlerUL = document.getElementById("fav-sehirler-listesi");

            // Mevcut liste öğelerini temizle
            while (favoriSehirlerUL.firstChild) {
                favoriSehirlerUL.removeChild(favoriSehirlerUL.firstChild);
            }
            const favla2 = document.getElementById("favButton");
            // Favori şehirleri listele ve tıklanabilir hale getir
            gelenData.forEach((sehir) => {
                console.log("sehir", sehir);
                let li = document.createElement("li");
                li.innerText = sehir.name;
                li.className = "sehirsecenek"; // Stil eklemek için sınıf
                favoriSehirlerUL.appendChild(li);

                li.addEventListener("click", () => {
                    let secilen_city = sehir.name;
                    requestApi(sehir.name); // Tıklanan şehir için hava durumu isteği gönder
                    weatherDetails(sehir.name);

//! İÇ İÇE İKİ TANE CLİCK OLAYI VERDİĞİMDE ALERTİM 2 ŞEHRİ DE VERİYOR ÖNCEKİNİ DE TUTUYOR BUNU ARAŞTIR VE ÇÖZ ŞİMDLİİK BUTONU SİLMEK YETERLİ
                    // favla2.addEventListener("click", () => {
                    //     // Önceki dinleyiciyi kaldır

                    //     alert(`${sehir.name} zaten favori listenizde varrrr`);
                        


                    // });favla2.removeEventListener("click");
                    favla2.style.display='none';

                    while (favoriSehirlerUL.firstChild) {
                        favoriSehirlerUL.removeChild(favoriSehirlerUL.firstChild);
                    }

                    // Tüm favori şehirleri görünmez yap
                    // const allLis = favoriSehirlerUL.querySelectorAll("li");
                    // allLis.forEach(item => {
                    //     item.style.display = 'none'; // Tüm li öğelerini görünmez yap
                    // });
                    
                });
                
            });
        } else if (result.status === 'no_favorites') {
            alert("Favori listeniz boş.");
        } else {
            alert("Favori şehirler getirilemedi.");
        }
    } catch (error) {
        console.error('Favori şehirleri alırken hata oluştu:', error);
    }
}






// Butona tıklanınca favori şehirleri göster
const favlist = document.getElementById('favlist');
favlist.addEventListener("click", showFavorites);


// Butona tıklanınca favori şehirleri göster 2. sayfadaki a  etiketiyle
const favlist2 = document.getElementById('favlistiki');
favlist2.addEventListener("click", showFavorites);


// SAYFA YENİLENDİĞİNDE FAVSEHİRLER TABLOM BOŞSA BUTONUM GÖZÜKMESİN, DOLUYSA BUTONUM GÖZÜKSÜN İŞLEMİ
window.onload = async function () {
    const favoritesStatus = await checkFavorites();

    if (favoritesStatus === "bos degil") {
        favlist.classList.replace("fav", "fav-active"); // GÖRÜNÜRLÜK DÜZENLEME
        favlist2.classList.replace("fav", "fav-active");
    }
};





async function checkFavorites() {
    try {
        // Favori şehirler olup olmadığını kontrol et
        const response = await fetch('http://localhost/havadurum/havadurum.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                operation: 'check_fav_empty'
            })
        });

        const result = await response.json();

        if (result.status === 'has_favorites') {
            // Favori şehirler varsa, favori şehirleri gösterme fonksiyonunu çağır

            return "bos degil";
        } else {
            // Favori şehir yoksa uyarı göster
            return "bos";
        }
    } catch (error) {
        console.error('Favori kontrolü sırasında hata oluştu:', error);
    }
}




arrowBack.addEventListener("click", () => {  // GERİ TUŞU arrowback  UNUTMA
    wrapper.classList.remove("active");
});
