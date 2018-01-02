<html>
<body>

<?php
  echo "yes";
  if (isset($_POST["firstName"])){
    $firstName = $_POST["firstName"];
  }

  if (isset($_POST["lastName"])){
    $lastName = $_POST["lastName"];
  }

  if (isset($_POST["email"])){
    $email = $_POST["email"];
  }

  if (isset($_POST["age"])){
    $age = $_POST["age"];
    echo $age;
  }

  if (isset($_POST["fitnessDropdown"])){
    $fitnessLevel = $_POST["fitnessDropdown"];
    echo $fitnessLevel;
  }
?>

</body>
</html>
