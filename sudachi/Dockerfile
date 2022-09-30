FROM ekidd/rust-musl-builder

WORKDIR /app

RUN git clone --depth 1 https://github.com/WorksApplications/sudachi.rs.git
WORKDIR /app/sudachi.rs

RUN cargo build --release

RUN curl -L http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-20220519-small.zip > sudachi-dictionary-20220519-small.zip
RUN unzip sudachi-dictionary-20220519-small.zip && \
    mv sudachi-dictionary-20220519/system_small.dic resources/system.dic

RUN mkdir dist
RUN cp -r resources target/x86_64-unknown-linux-musl/release/sudachi dist

COPY ./sudachi-wrapper.sh dist
RUN sudo chmod +x dist/sudachi-wrapper.sh
