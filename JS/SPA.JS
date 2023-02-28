var app = angular.module("myApp", ["ngRoute"]);
app.controller("myCtrl", function($scope, $http, $rootScope, $location, $timeout) {
    $scope.user = [];
    $rootScope.checkoutQuiz = "";
    $scope.LSQuiz = [];
    //khi load lại lấy lại auth
    $rootScope.Auth = JSON.parse(sessionStorage.getItem("Auth"));
    $scope.user = JSON.parse(sessionStorage.getItem("LSQuiz"))

    if (JSON.parse(sessionStorage.getItem("user")) != null) {
        $scope.user = JSON.parse(sessionStorage.getItem("user"));
    } else {
        $http.get("JS/Students.js").then(
            function(rep) { $scope.user = rep.data },
            function(rep) { alert("Loi") }

        );
        $timeout(function() {
            sessionStorage.setItem("user", JSON.stringify($scope.user));
        }, 1000)
    }

    //ĐĂNG XUẤT
    $scope.dangxuat = function() {
        sessionStorage.removeItem("Auth");
        $rootScope.Auth = JSON.parse(sessionStorage.getItem("Auth"));
        $location.url("/trangchu");
    }


    $scope.updateArrayUser = function(Auth) {
        for (var i = 0; i < $scope.user.length; i++) {
            if ($scope.user[i].username == Auth.username) {
                $scope.user[i] = Auth;
            }
        }
        sessionStorage.setItem("user", JSON.stringify($scope.user));
    }

})

app.run(function($rootScope, $location) {
    //check có đang làm Quiz hay k nếu có không cho thoát tab
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        if ($rootScope.checkoutQuiz == location.href) {
            var a = confirm("Bạn có muốn kết thúc bài ?");
            if (a == false) {
                event.preventDefault();
            } else {
                $rootScope.cancelDongHo();
                sessionStorage.removeItem("QuizTime");
                sessionStorage.removeItem("cauHoi");
                sessionStorage.removeItem("ListCauTL");
            }
        }
    });
})

//Phân trang SPA
app.config(function($routeProvider) {
    $routeProvider.when("/gioithieu", {
            templateUrl: "gioithieu.html"
        }).when("/lienhe", {
            templateUrl: "lienhe.html"
        }).when("/khoahoc", {
            templateUrl: "khoahoc.html",
            controller: "KhoahocCtrl"
        }).when("/trangchu", {
            templateUrl: "trangchu.html?" + Math.random()
        }).when("/dangnhap", {
            templateUrl: "dangnhap.html",
            controller: "dangNhapCtrl"
        }).when("/dangky", {
            templateUrl: "dangky.html",
            controller: "dangKyCtrl"
        }).when("/thongtin", {
            templateUrl: "thongtin.html",
            controller: "thongTinCtrl"
        }).when("/doimatkhau", {
            templateUrl: "doiMatKhau.html",
            controller: "doiMatKhauCtrl"
        }).when("/tracnghiem/:idMH/:tenMH", {
            templateUrl: "tracNghiem.html",
            controller: "tracNghiemCtrl",
        }).when("/diemQuiz", {
            templateUrl: "ketQuaQuiz.html",
        })
        .otherwise({
            templateUrl: "trangchu.html"

        })
})


//controller khóa học
app.controller("KhoahocCtrl", function($scope, $http, $routeParams) {
    $scope.khoahoc = [];
    $http.get("JS/Subjects.js").then(function(response) {
        $scope.khoahoc = response.data;
    })
})


//controller trắc nghiệm
app.controller("tracNghiemCtrl", function($scope, $rootScope, $http, $routeParams, $interval, $timeout, $location) {
    //Bô câu hỏi trong quiz
    $scope.boCauHoi = [];
    $scope.cauHoi = [];
    $scope.idMH = $routeParams.idMH;
    $rootScope.tenMH = $routeParams.tenMH;
    $rootScope.checkoutQuiz = location.href;

    //lấy ra bộ câu hỏi
    $http.get("JS/Quizs/" + $scope.idMH + ".js").then(function(response) {
        // sessionStorage.removeItem("cauHoi");
        $scope.boCauHoi = response.data;
    }, function(e) { alert("Lỗi") });



    //xáo trộn câu hỏi
    $scope.shuffleArray = function() {
            for (var i = $scope.boCauHoi.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = $scope.boCauHoi[i];
                $scope.boCauHoi[i] = $scope.boCauHoi[j];
                $scope.boCauHoi[j] = temp;
            }
        }
        //láy ra 10 câu đầu tiên
    $scope.ramdomQuiz = function() {
        $scope.shuffleArray();
        for (var i = 0; i < 10; i++) {
            $scope.cauHoi.push(angular.copy($scope.boCauHoi[i]));
        }
        sessionStorage.removeItem("cauHoi");
        sessionStorage.setItem("cauHoi", JSON.stringify($scope.cauHoi));
    }
    if (JSON.parse(sessionStorage.getItem("cauHoi")) == null) {
        $timeout($scope.ramdomQuiz, 100);
    } else {
        $scope.cauHoi = JSON.parse(sessionStorage.getItem("cauHoi"));
    }


    //Phân trang    
    $scope.index = 0;
    $scope.next = function() {
        if ($scope.index == $scope.cauHoi.length - 1) {
            $scope.index = 0;
        } else {
            $scope.index += 1;
        }
    }
    $scope.prev = function() {
        if ($scope.index == 0) {
            $scope.index = $scope.cauHoi.length;
        }
        $scope.index -= 1;
    }


    //Lấy id câu hỏi
    $scope.cauTraLoi = {};
    $scope.listCauTL = [];
    if (JSON.parse(sessionStorage.getItem("ListCauTL")) != null) {
        $scope.listCauTL = JSON.parse(sessionStorage.getItem("ListCauTL"));
    } else {
        $scope.listCauTL = [];
    }

    //Lưu đáp án
    $scope.luuDapAn = function() {
        //lấy id câu hỏi
        $scope.cauTraLoi.idCauHoi = $scope.cauHoi[$scope.index].Id;
        //duyệt id câu hỏi tồn tại chưa
        for (var i = 0; i < $scope.listCauTL.length; i++) {
            if ($scope.cauTraLoi.idCauHoi == $scope.listCauTL[i].idCauHoi) {
                if ($scope.cauTraLoi.idTraLoi != null) {
                    $scope.listCauTL[i].idTraLoi = angular.copy($scope.cauTraLoi.idTraLoi);
                }
                sessionStorage.setItem("ListCauTL", JSON.stringify($scope.listCauTL));
                $scope.cauTraLoi.idTraLoi = null;
                return;
            }
        }
        $scope.listCauTL.push(angular.copy($scope.cauTraLoi));
        sessionStorage.setItem("ListCauTL", JSON.stringify($scope.listCauTL));
        $scope.cauTraLoi.idTraLoi = null;
    }


    // checked lại đáp án đã chọn
    $scope.check = function(idCH, idTL) {
        for (var i = 0; i < $scope.listCauTL.length; i++) {
            if (idCH == $scope.listCauTL[i].idCauHoi && idTL == $scope.listCauTL[i].idTraLoi) {
                return true;
            }
        }
        return false;
    }


    //lập lại liên tục  đồng hồ
    $scope.dongHo = function() {
        $scope.QuizTime = JSON.parse(sessionStorage.getItem("QuizTime"));
        if ($scope.QuizTime == null) {
            $scope.second = 00;
            $scope.min = 15;
            $scope.timeCountdown = $scope.min + ':0' + $scope.second;
        } else {
            $scope.second = $scope.QuizTime.second;
            $scope.min = $scope.QuizTime.min;
        }
        if ($scope.second == 0) {
            $scope.min--;
            $scope.second = 59;
        } else {
            $scope.second--;
        }
        if ($scope.min < 10 && $scope.second < 10) {
            $scope.timeCountdown = '0' + $scope.min + ':0' + $scope.second;
        } else if ($scope.min < 10) {
            $scope.timeCountdown = '0' + $scope.min + ':' + $scope.second;
        } else if ($scope.second < 10) {
            $scope.timeCountdown = $scope.min + ':0' + $scope.second;
        } else {
            $scope.timeCountdown = $scope.min + ':' + $scope.second;
        }
        $scope.QuizTime = { "min": $scope.min, "second": $scope.second };
        sessionStorage.setItem("QuizTime", JSON.stringify($scope.QuizTime));

        if ($scope.min == 14 && $scope.second == 0) {
            // sessionStorage.removeItem("QuizTime");
            $scope.nopBai();
        }
    }

    var dongHoInterVal = $interval($scope.dongHo, 1000);
    $rootScope.cancelDongHo = function() {
        $interval.cancel(dongHoInterVal);
        sessionStorage.removeItem("QuizTime");
    }


    //NỘP BÀI
    $scope.nopBai = function() {
        $rootScope.diem = 0;
        $rootScope.checkoutQuiz = "";
        var listCauTL = JSON.parse(sessionStorage.getItem("ListCauTL"));
        var cauHoi = JSON.parse(sessionStorage.getItem("cauHoi"));
        if (JSON.parse(sessionStorage.getItem("ListCauTL")) == null) {
            alert("Vui lòng làm bài !");
        } else {
            for (var i = 0; i < cauHoi.length; i++) {
                for (var j = 0; j < listCauTL.length; j++) {
                    if (cauHoi[i].Id == listCauTL[j].idCauHoi) {
                        if (cauHoi[i].AnswerId == listCauTL[j].idTraLoi) {
                            $rootScope.diem++;
                        }
                    }
                }
            }
            sessionStorage.removeItem("ListCauTL");
            sessionStorage.removeItem("cauHoi");
            $location.url("/diemQuiz");
            $rootScope.cancelDongHo();
        }
    }


    $rootScope.luuKetQua = function() {
        $scope.ketQua = {};
        $scope.ketQua.tenMH = angular.copy($rootScope.tenMH);
        $scope.ketQua.diem = angular.copy($rootScope.diem);
        $scope.ketQua.username = angular.copy($rootScope.Auth.username);
        $scope.ketQua.date = angular.copy(new Date);
        $scope.LSQuiz.push(angular.copy($scope.ketQua));
        sessionStorage.setItem("LSQuiz", JSON.stringify($scope.LSQuiz));
        $location.url("/khoahoc");
    }


})

//controller đăng nhập
app.controller("dangNhapCtrl", function($scope, $rootScope, $location) {
    $scope.taiKhoan = "";
    $scope.matKhau = "";

    $scope.dangNhap = function() {
        if ($scope.formDangNhap.$valid) {
            for (var i = 0; i < $scope.user.length; i++) {
                if ($scope.taiKhoan == $scope.user[i].username && $scope.matKhau == $scope.user[i].password) {
                    $rootScope.Auth = (($scope.user[i]));
                    sessionStorage.setItem("Auth", JSON.stringify($scope.user[i]));
                    $location.url("/trangchu");
                    return;
                }
            }
            alert("Tài khoản mật khẩu không chính xác !");
        }
    }

})


//controller đăng ký
app.controller("dangKyCtrl", function($scope, $http, $location) {
    $scope.newuser = {};


    $scope.dangky = function() {
        if ($scope.formDangKy.$valid) {
            for (var i = 0; i < $scope.user.length; i++) {
                if ($scope.newuser.username == $scope.user[i].username) {
                    alert("Tên tài khoản đã tồn tại !");
                    return;
                }
            }
            if ($scope.matKhau != $scope.xnMatKhau) {
                alert("xác nhận mật khẩu không chính xác");
            } else {
                $scope.newuser.password = $scope.matKhau;
                $scope.user.push(angular.copy($scope.newuser));
                sessionStorage.setItem("user", JSON.stringify($scope.user))
                alert("Đăng ký thành công");
                $location.url("/dangnhap");
            }
        }

    }
})

//controller thông tin tài khoản
app.controller("thongTinCtrl", function($scope, $rootScope) {
    $scope.thongTin = angular.copy($rootScope.Auth);
    $scope.thongTin.birthday = new Date($scope.thongTin.birthday);

    $scope.update = function() {
        var check = confirm("Bạn thật sự muốn cập nhật")
        if (check == true) {
            $rootScope.Auth = angular.copy($scope.thongTin);
            sessionStorage.setItem("Auth", JSON.stringify($rootScope.Auth));
            alert("Cập nhật thành công")
            $scope.updateArrayUser($rootScope.Auth);
        }

    }


})

//controller đổi mật khẩu
app.controller("doiMatKhauCtrl", function($scope, $rootScope) {
    $scope.doiMatKhau = {};
    $scope.doiMK = function() {
        if ($scope.doiMatKhau.passCu == $rootScope.Auth.password) {
            if ($scope.doiMatKhau.passMoi == $scope.doiMatKhau.passXN) {
                $rootScope.Auth.password = angular.copy($scope.doiMatKhau.passMoi);
                sessionStorage.setItem("Auth", JSON.stringify($rootScope.Auth));
                alert("đổi thành công");
                $scope.updateArrayUser($rootScope.Auth);
            } else {
                alert("Xác nhận mật khẩu không trùng nhau !");
            }
        } else {
            alert("Mật khẩu củ sai !");
        }
    }
})