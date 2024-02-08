<?php

//Schutz vor Aufruf durch Dritte:
//Um den Schutz zu aktivieren
// a) $schutz_aktiv = true setzen
// b) in $valids die gültigen Domänen reinschreiben (etwas dirty, bei Bedarf gerne schöner machen)
function valid_Referrer() {
    $protected = true;
    if (!$protected) {
        return true;
    } else {
        $referrer = @$_SERVER["HTTP_REFERER"];
        $valids = ["://auto-traktor-bretschneider.de", "://www.auto-traktor-bretschneider.de", "://dev.auto-traktor-bretschneider.de", "://auto-traktor-bretschneider.de","://dev.auto-traktor-bretschneider.test",];
        foreach ($valids as $valid) {
            if (strpos($referrer, $valid) >= 1) {
                return true;
            }
        }
        return false;
    }
}
