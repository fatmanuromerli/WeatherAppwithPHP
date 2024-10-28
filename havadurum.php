<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$user = "root";
$password = "";
$dbName = "cities";

try {
    $dsn = "mysql:host=" . $host . ";dbname=" . $dbName;
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $name = $_POST['city'] ?? '';
        $operation = $_POST['operation'] ?? '';
        $id = $_POST['id'] ?? '';

        // Şehirleri al
        if ($operation === 'sehir') {

            $stmt = $pdo->prepare("SELECT * FROM sehirler WHERE name LIKE :name");
            $searchTerm = '%' . $name . '%';
            $stmt->bindParam(':name', $searchTerm);
            $stmt->execute();


            $cities = $stmt->fetchAll();


            echo json_encode(['data' => $cities, 'status' => '200']);
        }
        // Favorilere ekleme işlemi
        else if ($operation === 'favori') {
            // Şehrin id'sini sehirler tablosundan al
            $cityName = $_POST['city'];
            $stmt = $pdo->prepare("SELECT id FROM sehirler WHERE name = :name");
            $stmt->bindParam(':name', $cityName);
            $stmt->execute();
            $cityId = $stmt->fetchColumn();

            if ($cityId) {
                // Şehrin favorilerde olup olmadığını kontrol et
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM favsehir WHERE u_cityID = :u_cityID");
                $stmt->bindParam(':u_cityID', $cityId);
                $stmt->execute();
                $isFavorite = $stmt->fetchColumn();

                if ($isFavorite > 0) {
                    // Şehir zaten favorilerde
                    echo json_encode(['message' => 'Bu şehir zaten favori listenizde', 'status' => '202']);
                } else {
                    // Şehri favsehir tablosuna ekle
                    $stmt = $pdo->prepare("INSERT INTO favsehir (u_cityID) VALUES (:u_cityID)");
                    $stmt->bindParam(':u_cityID', $cityId);
                    $stmt->execute();

                    echo json_encode(['data' => $cityId, 'status' => '200']);
                }
            } else {
                echo json_encode(['message' => 'Şehir bulunamadı', 'status' => '404']);
            }
        }



        // Favori şehirleri getir
        else if ($operation === 'favorigetir') {
            // Favori şehirler tablosunun boş olup olmadığını kontrol et ve şehirleri getir
            $stmt = $pdo->query("SELECT COUNT(*) FROM favsehir");
            $count = $stmt->fetchColumn();
        
            if ($count > 0) {
                // Favori şehirler varsa, şehirleri çek
                $stmt = $pdo->prepare("SELECT sehirler.name FROM favsehir INNER JOIN sehirler ON favsehir.u_cityID = sehirler.id");
                $stmt->execute();
                $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['data' => $favorites, 'status' => '200']);
            } else {
                // Favori şehir yoksa boş liste döndür
                echo json_encode(['status' => 'no_favorites']);
            }
        }
        else if ($operation === 'check_fav_empty') {
            // Favori şehirler tablosunun boş olup olmadığını kontrol et
            $stmt = $pdo->query("SELECT COUNT(*) FROM favsehir");
            $count = $stmt->fetchColumn();

            if ($count > 0) {
                // Favori şehirler varsa 'has_favorites' döner
                echo json_encode(['status' => 'has_favorites']);
            } else {
                // Favori şehir yoksa 'no_favorites' döner
                echo json_encode(['status' => 'no_favorites']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'sehir adi eksik veya baska bi hata']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gecersiz islem- HER SEY YANLIS!']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Bağlantı hatası: ' . $e->getMessage()]);
}
?>