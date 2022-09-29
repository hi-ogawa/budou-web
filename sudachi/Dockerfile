FROM ekidd/rust-musl-builder

WORKDIR /app

RUN git clone --depth 1 https://github.com/WorksApplications/sudachi.rs.git
WORKDIR /app/sudachi.rs

RUN cargo build --release

RUN ./fetch_dictionary.sh

RUN mkdir dist
RUN cp -r resources target/x86_64-unknown-linux-musl/release/sudachi dist
RUN tar -czvf dist.tar.gz dist
