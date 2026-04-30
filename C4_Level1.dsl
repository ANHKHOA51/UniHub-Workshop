workspace "UniHub Workshop" "Hệ thống quản lý đăng ký và check-in sự kiện." {

    model {
        # Người dùng (Actors)
        student = person "Sinh viên" "Xem lịch, đăng ký, thanh toán và check-in."
        admin = person "Ban tổ chức" "Tạo, quản lý workshop và xem thống kê."
        staff = person "Nhân sự Check-in" "Quét mã QR tại cửa."

        # Hệ thống phần mềm (Software System)
        unihub = softwareSystem "UniHub Workshop" "Hệ thống quản lý đăng ký và check-in sự kiện." "MainSystem"

        # Hệ thống bên ngoài (External Systems)
        legacy_sys = softwareSystem "Legacy Student System" "Hệ thống cũ của trường (xuất CSV)." "External"
        momo = softwareSystem "MoMo Sandbox" "Cổng thanh toán điện tử." "External"
        openrouter = softwareSystem "OpenRouter AI" "Dịch vụ tóm tắt nội dung PDF." "External"
        email_sys = softwareSystem "Email Service" "Hệ thống gửi email thông báo." "External"

        # Các mối quan hệ (Relationships)
        student -> unihub "Đăng ký, xem lịch, nhận QR" "HTTPS"
        admin -> unihub "Quản trị hệ thống" "HTTPS"
        staff -> unihub "Check-in sinh viên" "HTTPS/Offline Sync"

        unihub -> legacy_sys "Đọc file CSV hàng đêm" "File System/FTP"
        unihub -> momo "Xử lý thanh toán" "HTTPS"
        unihub -> openrouter "Gửi văn bản, nhận tóm tắt" "HTTPS"
        unihub -> email_sys "Gửi thông báo" "SMTP/API"
    }

    views {
        systemContext unihub "SystemContext" {
            include *
            autoLayout lr
        }

        styles {
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "MainSystem" {
                background #08427b
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
        }
    }
}