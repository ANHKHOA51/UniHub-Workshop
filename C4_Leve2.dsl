workspace "UniHub Workshop" "Hệ thống quản lý đăng ký và check-in sự kiện" {
    model {
        student = person "Sinh viên" "Người dùng xem lịch, đăng ký và thanh toán."
        admin = person "Ban tổ chức" "Quản trị viên quản lý nội dung và theo dõi hệ thống."
        staff = person "Nhân sự" "Người quét mã QR xác nhận tham dự."

        unihub = softwareSystem "UniHub Workshop" "Hệ thống quản lý đăng ký và check-in sự kiện." {
            web_app = container "Web Application" "Giao diện Web dành cho Sinh viên và Admin." "React"
            mobile_app = container "Mobile App" "Ứng dụng di động quét QR hỗ trợ Offline-first." "React Native"
            api_server = container "API Server" "Xử lý yêu cầu HTTP, Validation và Logic nghiệp vụ (MVC)." "Node.js, Express.js"
            worker = container "Workers" "Tiến trình xử lý tác vụ nền: AI, Email, Import CSV, Thanh toán." "Node.js, BullMQ"
            db = container "Primary Database" "Lưu trữ dữ liệu User, Workshop, Registration, Payment." "PostgreSQL" "Database"
            redis = container "Redis/Broker" "Lưu trữ cache và hàng đợi thông điệp." "Redis" "Database"
        }

        legacy_sys = softwareSystem "Legacy System" "Hệ thống cũ cung cấp file CSV sinh viên hàng đêm." "External"
        momo = softwareSystem "MoMo Sandbox" "Cổng thanh toán điện tử cho workshop có phí." "External"
        openrouter = softwareSystem "OpenRouter AI" "Dịch vụ AI tóm tắt nội dung từ PDF." "External"
        email_sys = softwareSystem "Email Service" "Hệ thống gửi thông báo xác nhận và mã QR." "External"

        # Relationships
        student -> web_app "Sử dụng" "HTTPS"
        admin -> web_app "Quản trị" "HTTPS"
        staff -> mobile_app "Sử dụng" "HTTPS"

        web_app -> api_server "Giao tiếp API" "HTTP/JSON"
        mobile_app -> api_server "Giao tiếp API & Sync" "HTTP/JSON"

        api_server -> db "Đọc/Ghi dữ liệu" "SQL/TCP"
        api_server -> redis "Gửi yêu cầu vào hàng đợi" "RESP/TCP"
        api_server -> redis "Đọc/Ghi Cache & Session" "RESP/TCP"
        redis -> worker "Phân phối tác vụ xử lý" "RESP/TCP"
        worker -> db "Đọc/Ghi dữ liệu" "SQL/TCP"
        worker -> momo "Thực hiện yêu cầu thanh toán" "HTTPS/JSON"
        worker -> openrouter "Gửi văn bản AI" "HTTPS/JSON"
        worker -> email_sys "Gửi email" "SMTP/API"
        worker -> legacy_sys "Đọc dữ liệu CSV" "File/SFTP"
    }

    views {
        container unihub "Containers" {
            include *
            autolayout lr
        }

        styles {
            element "Element" {
                color #ffffff
            }
            element "Person" {
                background #08427b
                shape Person
            }
            element "Software System" {
                background #1168bd
            }
            element "Container" {
                background #438dd5
            }
            element "Database" {
                shape Cylinder
            }
            element "External" {
                background #999999
            }
        }
    }
}
