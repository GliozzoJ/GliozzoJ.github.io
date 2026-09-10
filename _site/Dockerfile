FROM ruby:3.2-bookworm

ENV BUNDLE_PATH=/usr/local/bundle \
    JEKYLL_ENV=development

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        chromium \
        curl \
        fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY Gemfile ./
RUN bundle install

COPY . .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--force_polling", "--destination", "/tmp/gliozzo-site"]
