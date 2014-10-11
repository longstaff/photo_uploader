<?php
//Loop through each file

$name = $_POST['name'];
$name = preg_replace("/[^a-zA-Z0-9_\s-]/", "", $name);
$name = preg_replace("/[\s-]+/", "_", $name);

$isGood = true;

for ($i=0; $i<count($_FILES['upload']['name']); $i++) {
//Get the temp file path
    $tmpFilePath = $_FILES['upload']['tmp_name'][$i];

    if ($tmpFilePath != "" && is_uploaded_file($tmpFilePath)) {
        //Setup our new file path
        $newFilePath = sprintf(
            "%s/uploadedPhotos/%s_%d_%s_%s",
            dirname(__FILE__),
            $_SERVER['REQUEST_TIME'],
            $i,
            $name,
            $_FILES['upload']['name'][$i]
        );

        //Upload the file into the temp dir
        if (! move_uploaded_file($tmpFilePath, $newFilePath)) {
            $isGood = false;
        }
    }
}

if (! $isGood) {
    header("500 Internal Server Error", true, 500);
}
